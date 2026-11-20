import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type {
  ScrutinCategory,
  ScrutinSummary,
  ScrutinType,
} from '@/src/assemblee/models/scrutin.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

export const categoryLabel = (category: ScrutinCategory): string => COPY.category[category];

export const categoryHelp = (category: ScrutinCategory): string => COPY.categoryHelp[category];

/** Libellé court (ligne d'en-tête). */
export const voteTypeLabel = (type: ScrutinType): string => COPY.voteType[type];

/** Libellé expliqué (détails du vote). */
export const voteTypeDetail = (type: ScrutinType): string => COPY.voteTypeDetail[type];

/** Titre officiel : seule la première lettre est mise en capitale, jamais réécrit ni résumé. */
export const capitalizeTitle = (title: string): string =>
  title.charAt(0).toLocaleUpperCase('fr') + title.slice(1);

/** « Adopté » / « Rejeté » ; au féminin pour une motion. */
export const resultLabel = (scrutin: Pick<ScrutinSummary, 'adopte' | 'type'>): string => {
  const feminine = scrutin.type === 'MOC';
  const key = scrutin.adopte ? (feminine ? 'adoptee' : 'adopte') : feminine ? 'rejetee' : 'rejete';
  return COPY.result[key];
};

export const scrutinHeading = (scrutin: Pick<ScrutinSummary, 'numero' | 'date'>): string =>
  COPY.scrutin.pageTitle(scrutin.numero, formatLongDate(scrutin.date));

/** Référence discrète d'un vote : le numéro officiel du scrutin. */
export const scrutinReference = (numero: number): string => COPY.scrutin.reference(numero);

/** Décompte d'une ligne de liste. Censure : l'Assemblée ne recense que les voix pour. */
export const countsLabel = (scrutin: ScrutinSummary): string => {
  const { pour, contre, abstentions, requis } = scrutin.synthese;
  return scrutin.type === 'MOC'
    ? COPY.list.countsCensure(pour, requis)
    : COPY.list.counts(pour, contre, COPY.list.abstentions(abstentions));
};

/**
 * La source sépare plusieurs demandeurs par des retours à la ligne ; une même glose s'ajoute à
 * chaque demandeur dont le nom est exactement celui qu'elle explique.
 */
export const requesters = (demandeur: string | null): string[] =>
  (demandeur ?? '')
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => {
      const gloss = COPY.requesterGloss[name];
      return gloss ? `${name} ${gloss}` : name;
    });

export {
  scrutinHelpLinks,
  scrutinNature,
  scrutinShortTitle,
  scrutinStage,
} from '@/src/assemblee/models/scrutin-nature';
