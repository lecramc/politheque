import { APP_NAME } from '@/src/core/config/app';
import type { Catalog } from '@/src/programmes/models/programme.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';
import { PARTY_SECTIONS, partyHref } from '@/src/programmes/models/seo/party-sections';
import { absoluteUrl, type SiteUrl } from '@/src/programmes/models/seo/site-routes';

/** Index lisible par les moteurs de réponse : uniquement des pages indexables. */
export function buildLlmsTxt(catalog: Catalog, urls: SiteUrl[]): string {
  const indexable = new Set(urls.filter((u) => u.indexable).map((u) => u.path));
  const link = (label: string, path: string) =>
    indexable.has(path) ? [`- [${label}](${absoluteUrl(path)})`] : [];
  const last = maxIsoDate(urls.filter((u) => u.indexable).map((u) => u.lastmod));
  const parties = [...catalog.parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return [
    `# ${APP_NAME}`,
    '',
    `> Site indépendant et non partisan pour comprendre la politique française : institutions, partis, élections, grands débats. Chaque information est sourcée et datée.`,
    '',
    '## Charte',
    '',
    '- Aucune affirmation sans source datée.',
    "- Le même gabarit pour tous les partis, présentés dans l'ordre alphabétique.",
    '- Les corrections sont publiques.',
    ...link('Méthodologie, sources et corrections', '/methodologie'),
    ...link('Journal des corrections', '/corrections'),
    '',
    '## Comprendre',
    '',
    ...link('Comprendre la politique française', '/comprendre'),
    ...catalog.guide.flatMap((s) => link(s.title, `/comprendre/${s.id}`)),
    '',
    '## Partis (ordre alphabétique)',
    '',
    ...link('Tous les partis', '/partis'),
    ...parties.flatMap((party) =>
      PARTY_SECTIONS.flatMap((section) =>
        link(`${party.name} : ${section.label}`, partyHref(party.id, section.id))
      )
    ),
    '',
    '## Grands débats',
    '',
    ...link('Tous les débats', '/debats'),
    ...catalog.themes.flatMap((t) => link(t.title, `/debats/${t.id}`)),
    '',
    '## Élections',
    '',
    ...link('Les élections', '/elections'),
    ...catalog.elections.flatMap((e) => link(e.title, `/elections/${e.id}`)),
    '',
    '## Outils',
    '',
    ...link('Test politique : de quels partis êtes-vous proche ?', '/me-situer'),
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
