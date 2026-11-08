import { APP_NAME } from '@/src/core/config/app';
import type { Catalog, Party, Source } from '@/src/programmes/models/programme.model';
import { formatLongDate, formatPartialDate } from '@/src/programmes/models/seo/dates';
import { PARTY_SECTIONS, partyHref } from '@/src/programmes/models/seo/party-sections';
import { absoluteUrl } from '@/src/programmes/models/seo/site-routes';
import { STANCE_LABEL } from '@/src/programmes/models/stance-labels';

const PRESIDENTIAL = 'presidentielle-2027';

/** Sources uniques (par URL), dans l'ordre d'apparition. */
const uniqueSources = (sources: Source[]): Source[] => [
  ...new Map(sources.map((s) => [s.url, s])).values(),
];

const sourceLines = (sources: Source[]): string[] => {
  const unique = uniqueSources(sources);
  return unique.length
    ? ['', 'Sources :', ...unique.map((s) => `- ${s.title} (${s.date}) ${s.url}`)]
    : [];
};

function partyText(party: Party, catalog: Catalog): string[] {
  const candidacy = party.candidacies[PRESIDENTIAL];
  const sources: Source[] = [];
  const lines = [
    `## ${party.name} (${party.shortName})`,
    '',
    `Page : ${absoluteUrl(partyHref(party.id))}`,
    `Famille politique : ${party.family}`,
    `${party.description}`,
    `Fondé en ${party.foundedYear}. ${party.leader.role} ${party.leader.name}.`,
    `Données vérifiées le ${formatLongDate(party.lastVerified)}.`,
  ];

  if (candidacy) {
    lines.push(
      '',
      '### Présidentielle 2027',
      '',
      `${candidacy.candidateName} : ${candidacy.statusLabel}. ${candidacy.candidate}`,
      candidacy.programmeStatus
    );
    for (const theme of catalog.themes) {
      const programme = candidacy.themes[theme.id];
      if (!programme) continue;
      lines.push('', `#### ${theme.title}`, '', programme.summary);
      for (const measure of programme.measures) {
        lines.push(`- ${measure.text}`);
        sources.push(...measure.sources);
      }
    }
  }

  lines.push('', `### Positions sur ${catalog.questions.length} affirmations`, '');
  for (const question of catalog.questions) {
    const stance = party.stances[question.id];
    if (!stance) continue;
    lines.push(
      `- ${question.statement} : ${STANCE_LABEL[String(stance.stance)]}. ${stance.justification}`
    );
    sources.push(...stance.sources);
  }

  if (party.history) {
    lines.push(
      '',
      '### Histoire',
      '',
      `Fondation : ${party.history.founded}`,
      party.history.origins.text
    );
    sources.push(...party.history.origins.sources);
    for (const event of party.history.timeline) {
      lines.push(`- ${formatPartialDate(event.date)} : ${event.event}`);
      sources.push(...event.sources);
    }
  }

  return [...lines, ...sourceLines(sources), ''];
}

/**
 * Texte intégral pour les moteurs de réponse : fiches des partis (ordre alphabétique, même gabarit
 * pour tous) et guide « Comprendre ». Généré à partir des données du catalogue, jamais saisi.
 */
export function buildLlmsFullTxt(catalog: Catalog): string {
  const parties = [...catalog.parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const guide = catalog.guide.flatMap((section) => {
    const sources: Source[] = [];
    const lines = [
      `## ${section.title}`,
      '',
      `Page : ${absoluteUrl(`/comprendre/${section.id}`)}`,
      '',
      section.summary,
    ];
    for (const block of section.blocks) {
      lines.push('', `### ${block.heading}`, '', ...block.paragraphs, ...(block.more ?? []));
      sources.push(...block.sources);
    }
    return [...lines, ...sourceLines(sources), ''];
  });

  return [
    `# ${APP_NAME} : texte intégral`,
    '',
    `> Texte des fiches de partis et du guide « Comprendre la politique française », généré à partir des données publiées sur ${absoluteUrl('/')}. Site indépendant et non partisan : chaque information est sourcée et datée, et les partis sont présentés dans l'ordre alphabétique avec le même gabarit (${PARTY_SECTIONS.map((s) => s.label.toLowerCase()).join(', ')}).`,
    '',
    '# Guide : Comprendre la politique française',
    '',
    ...guide,
    '# Partis (ordre alphabétique)',
    '',
    ...parties.flatMap((party) => partyText(party, catalog)),
  ].join('\n');
}
