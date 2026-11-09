import { APP_NAME } from '@/src/core/config/app';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import type { Catalog } from '@/src/programmes/models/programme.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';
import {
  PARTY_SECTIONS,
  partyHref,
  type PartySection,
} from '@/src/programmes/models/seo/party-sections';
import { absoluteUrl, type SiteUrl } from '@/src/programmes/models/seo/site-routes';

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Ligne de description d'une page de fiche : un seul gabarit pour tous les partis. */
const SECTION_DESCRIPTION: Record<PartySection, (questionCount: number) => string> = {
  programme: () =>
    'candidature à la présidentielle 2027 et programme thème par thème, avec sources.',
  positions: (n) => `position sur les ${n} affirmations du questionnaire, justifiée et sourcée.`,
  histoire: () => 'origines, fondateurs, idées revendiquées, dates clés et classification.',
  procedures: () => 'procédures judiciaires recensées, avec statut exact et date de vérification.',
};

/** Index lisible par les moteurs de réponse : uniquement des pages indexables. */
export function buildLlmsTxt(catalog: Catalog, urls: SiteUrl[]): string {
  const indexable = new Set(urls.filter((u) => u.indexable).map((u) => u.path));
  const link = (label: string, path: string, description?: string) =>
    indexable.has(path)
      ? [`- [${label}](${absoluteUrl(path)})${description ? `: ${oneLine(description)}` : ''}`]
      : [];
  const last = maxIsoDate(urls.filter((u) => u.indexable).map((u) => u.lastmod));
  const parties = [...catalog.parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return [
    `# ${APP_NAME}`,
    '',
    `> Site indépendant et non partisan pour comprendre la politique française : institutions, partis, grands débats, présidentielle 2027. Chaque information est sourcée et datée.`,
    '',
    '## Charte',
    '',
    '- Aucune affirmation sans source datée.',
    "- Le même gabarit pour tous les partis, présentés dans l'ordre alphabétique.",
    '- Les corrections sont publiques.',
    ...link(
      'Méthodologie, sources et corrections',
      '/methodologie',
      'comment les informations sont choisies, vérifiées et présentées, et comment lire chaque page.'
    ),
    ...link(
      'Journal des corrections',
      '/corrections',
      'chaque correction de fond, datée et publique.'
    ),
    '',
    '## Comprendre',
    '',
    ...link(
      'Comprendre la politique française',
      '/comprendre',
      `guide en ${catalog.guide.length} leçons : institutions, élections, partis, droits.`
    ),
    ...catalog.guide.flatMap((s) => link(s.title, `/comprendre/${s.id}`, s.summary)),
    ...link(
      'Lexique de la politique française',
      CONTENUS_2027_PATHS.lexicon,
      `${catalog.lexicon.length} termes expliqués en ordre alphabétique, chacun avec ses sources.`
    ),
    '',
    '## Partis (ordre alphabétique)',
    '',
    ...link(
      'Tous les partis et les grands débats',
      '/partis',
      `les ${catalog.parties.length} partis présentés avec le même gabarit, et les grands débats.`
    ),
    ...link(
      'Comparer deux partis',
      '/partis/comparer',
      'programme et positions de deux partis côte à côte, sans score ni classement.'
    ),
    ...parties.flatMap((party) =>
      PARTY_SECTIONS.flatMap((section) =>
        link(
          `${party.name} : ${section.label}`,
          partyHref(party.id, section.id),
          SECTION_DESCRIPTION[section.id](catalog.questions.length)
        )
      )
    ),
    '',
    '## Grands débats',
    '',
    ...catalog.themes.flatMap((t) => link(t.title, `/debats/${t.id}`, t.context)),
    '',
    '## Élections',
    '',
    ...catalog.elections.flatMap((e) => link(e.title, `/elections/${e.id}`, e.summary)),
    ...link(
      'Présidentielle 2027 : questions-réponses',
      CONTENUS_2027_PATHS.faq,
      `${catalog.faq.length} questions sur les dates, l'inscription, les candidatures et le scrutin, avec réponse courte et sources.`
    ),
    ...link(
      'Comment voter à la présidentielle 2027',
      CONTENUS_2027_PATHS.voter,
      "s'inscrire, vérifier son bureau de vote, procuration, vote depuis l'étranger, jour du scrutin."
    ),
    ...link(
      "Les candidats à l'élection présidentielle 2027",
      CONTENUS_2027_PATHS.candidates,
      'toutes les candidatures déclarées ou annoncées, en ordre alphabétique du nom de famille, avec leur statut daté et leurs sources.'
    ),
    '',
    '## Outils',
    '',
    ...link(
      'Test politique : de quels partis êtes-vous proche ?',
      '/me-situer',
      `${catalog.questions.length} affirmations, environ 5 minutes ; anonyme, aucune réponse n'est envoyée.`
    ),
    '',
    '## Texte intégral',
    '',
    `- [llms-full.txt](${absoluteUrl('/llms-full.txt')}): texte des fiches de partis, du guide « Comprendre », du lexique, des questions-réponses, de la page « Comment voter » et de la liste des candidats, avec leurs sources.`,
    '',
    '## Citer Polithèque',
    '',
    `Citer le nom du site (${APP_NAME}), l'URL de la page et la date « vérifié le » indiquée sur la page.`,
    ...(urls.some((u) => u.pattern === '/partis/[id]/procedures-judiciaires')
      ? [
          '',
          "Procédures judiciaires : citer le statut exact et la date de vérification ; une procédure non définitive n'établit pas la culpabilité.",
        ]
      : []),
    '',
    ...(last ? [`Dernière vérification : ${last}`, ''] : []),
  ].join('\n');
}
