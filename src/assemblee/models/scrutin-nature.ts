import { NATURE_COPY } from '@/src/assemblee/models/scrutin-nature.copy';
import type { ScrutinType } from '@/src/assemblee/models/scrutin.model';

/**
 * Nature, étape et titre court d'un vote, tirés du titre officiel par des règles fixes.
 * Rien n'est inventé : sans règle applicable, la fonction rend `null`.
 */

export type ScrutinNature = (typeof NATURE_COPY.natures)[number];

/** Le titre officiel commence par « l'… », « la… » ou « le… » : l'apostrophe peut être courbe. */
const normalize = (titre: string): string => titre.replace(/’/g, "'").trim();

const PART = /^(?:l'ensemble de )?la (?:première|deuxième|troisième|quatrième) partie /;

/** Premier qui s'applique, dans l'ordre : les parties de budget avant les textes entiers. */
const NATURE_RULES: [RegExp, ScrutinNature][] = [
  [/^l'amendement/, 'Amendement'],
  [/^la motion de censure/, 'Motion de censure'],
  [/^la motion de rejet/, 'Motion de rejet'],
  [/^la déclaration (?:.* )?du Gouvernement/, 'Déclaration du Gouvernement'],
  [new RegExp(`${PART.source}(?:du )?projet de loi de financ`), 'Partie du budget'],
  [/^l'article /, 'Article'],
  [/^l'ensemble (?:de de |de |du |d')/, 'Texte entier'],
  [/^(?:le projet|la proposition) de loi/, 'Texte entier'],
];

export const scrutinNature = (titre: string): ScrutinNature | null => {
  const text = normalize(titre);
  return NATURE_RULES.find(([rule]) => rule.test(text))?.[1] ?? null;
};

const STAGE = new RegExp(`\\((${NATURE_COPY.stages.join('|')})\\)\\.?$`);

export const scrutinStage = (titre: string): string | null =>
  normalize(titre).match(STAGE)?.[1] ?? null;

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase('fr') + text.slice(1);

/** Titre sans l'étape finale ni le point final. */
const withoutStage = (text: string): string => text.replace(STAGE, '').replace(/[\s.]+$/, '');

const AMENDMENT = /^l'amendement(?: de suppression)? n° (\d+)(?: \(rect\.\))?(.*)$/;
const TARGET = / (?:du|de la|au|à la|à l') ((?:projet|proposition) .*)$/;

const shortAmendment = (text: string): string | null => {
  const match = text.match(AMENDMENT);
  if (!match) return null;
  const [, number, rest] = match;
  const target = rest.match(TARGET)?.[1];
  if (!target) return null;
  const identical = /amendements identiques/.test(rest) ? ' et amendements identiques' : '';
  const preposition = target.startsWith('projet') ? 'au' : 'à la';
  return `Amendement n° ${number}${identical} ${preposition} ${target}`;
};

/** Titre court : mêmes mots que le titre officiel, sans l'auteur, l'étape ni « l'ensemble de ». */
export const scrutinShortTitle = (titre: string): string | null => {
  const nature = scrutinNature(titre);
  if (!nature) return null;
  const text = withoutStage(normalize(titre));
  switch (nature) {
    case 'Amendement':
      return shortAmendment(text);
    case 'Motion de censure':
      return capitalize(text.replace(/^la /, '').replace(/,? par .*$/, ''));
    case 'Motion de rejet':
      return capitalize(text.replace(/^la /, '').replace(/,? déposée par [^,]+,/, ''));
    case 'Texte entier':
      return capitalize(
        text.replace(/^l'ensemble du /, 'le ').replace(/^l'ensemble (?:de de |de )/, '')
      );
    default:
      return capitalize(text.replace(/^l'ensemble de /, '').replace(/^(?:la|l') ?/, ''));
  }
};

type HelpLink = { label: string; href: string };

const lexiconLink = (id: keyof typeof NATURE_COPY.lexicon): HelpLink => ({
  label: NATURE_COPY.lexicon[id],
  href: `/comprendre/lexique#${id}`,
});

const natureLexicon = (nature: ScrutinNature | null, titre: string) => {
  switch (nature) {
    case 'Motion de censure':
      return ['motion-de-censure' as const];
    case 'Partie du budget':
      return [
        /financement de la sécurité sociale/.test(titre)
          ? ('plfss' as const)
          : ('loi-de-finances' as const),
      ];
    case 'Texte entier':
      return ['projet-et-proposition-de-loi' as const];
    case 'Article':
      return ['article-de-loi' as const, 'projet-et-proposition-de-loi' as const];
    case 'Amendement':
      return ['amendement' as const];
    case 'Motion de rejet':
      return ['motion-de-rejet-prealable' as const];
    case 'Déclaration du Gouvernement':
      return /politique générale/.test(titre) ? ['question-de-confiance' as const] : [];
    default:
      return [];
  }
};

/** Aides sous le résultat : la leçon, puis les mots du lexique utiles pour ce vote. */
export const scrutinHelpLinks = ({
  titre,
  type,
}: {
  titre: string;
  type: ScrutinType;
}): HelpLink[] => {
  const text = normalize(titre);
  const stage = scrutinStage(text);
  const ids = [
    ...natureLexicon(scrutinNature(text), text),
    ...(stage === null
      ? []
      : [
          stage.startsWith('texte de la commission')
            ? ('commission-mixte-paritaire' as const)
            : ('lecture' as const),
        ]),
    type === 'SPS' ? ('scrutin-public-solennel' as const) : ('scrutin-public' as const),
    ...(type === 'MOC' ? [] : ['abstention' as const]),
  ];
  return [
    { label: NATURE_COPY.lessonLabel, href: NATURE_COPY.lessonHref },
    ...ids.map(lexiconLink),
  ];
};
