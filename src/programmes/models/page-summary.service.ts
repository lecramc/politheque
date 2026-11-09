import { formatLongDate } from '@/src/programmes/models/presentation.service';
import type {
  Candidacy,
  Election,
  ElectionType,
  Party,
  Theme,
  ThemeId,
} from '@/src/programmes/models/programme.model';
import { partyLabel } from '@/src/programmes/models/seo/page-meta';

/**
 * Phrase de résumé en tête des fiches et des débats (audit SEO v2, § 5.1, C-6) : datée, factuelle,
 * compréhensible hors contexte (moteurs de réponse). Générée uniquement depuis les données publiées,
 * avec un seul gabarit par type de page : aucun mot n'y est propre à un parti ou à un thème.
 */

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

/** « de Marine Le Pen », « d'Éric Zemmour ». */
const of = (name: string) => (/^[aeiouyàâäéèêëîïôöùûü]/i.test(name) ? `d'${name}` : `de ${name}`);

const lowerFirst = (text: string) => text.charAt(0).toLocaleLowerCase('fr') + text.slice(1);

const ELECTION_NAMES: Record<ElectionType, string> = {
  presidentielle: "à l'élection présidentielle",
  legislatives: 'aux élections législatives',
  europeennes: 'aux élections européennes',
  municipales: 'aux élections municipales',
  senatoriales: 'aux élections sénatoriales',
  regionales: 'aux élections régionales',
  departementales: 'aux élections départementales',
};

/** « à l'élection présidentielle de 2027 » (année du premier tour). */
export const electionPhrase = (election: Pick<Election, 'type' | 'rounds'>) =>
  `${ELECTION_NAMES[election.type]} de ${election.rounds[0]?.date.slice(0, 4) ?? ''}`.trim();

const hasMeasures = (candidacy: Candidacy, themeId: ThemeId) =>
  (candidacy.themes[themeId]?.measures.length ?? 0) > 0;

/**
 * « Au 3 novembre 2026, Rassemblement national (RN) : candidature de Marine Le Pen à l'élection
 * présidentielle de 2027 (candidate déclarée) ; propositions recensées dans 9 thèmes sur 9. »
 */
export function partySummary({
  party,
  candidacy,
  electionTitle,
  themeIds,
}: {
  party: Pick<Party, 'name' | 'shortName' | 'lastVerified'>;
  candidacy: Candidacy;
  /** « à l'élection présidentielle de 2027 » (`electionPhrase`). */
  electionTitle: string;
  themeIds: ThemeId[];
}): string {
  const covered = themeIds.filter((id) => hasMeasures(candidacy, id)).length;
  return (
    `Au ${formatLongDate(party.lastVerified)}, ${partyLabel(party)} : candidature ` +
    `${of(candidacy.candidateName)} ${electionTitle} (${lowerFirst(candidacy.statusLabel)}) ; ` +
    `propositions recensées dans ${plural(covered, 'thème')} sur ${themeIds.length}.`
  );
}

/**
 * « Au 8 novembre 2026, sur le thème « Économie, impôts et dette », Polithèque recense les
 * propositions de 10 partis sur 10, par ordre alphabétique, et 4 chiffres clés sourcés. »
 */
export function debateSummary({
  theme,
  date,
  candidacies,
}: {
  theme: Pick<Theme, 'id' | 'title' | 'keyFigures'>;
  /** Date de la page (ISO), la même que son `dateModified`. */
  date: string;
  /** Candidatures à l'élection mise en avant (une par parti suivi). */
  candidacies: Candidacy[];
}): string {
  const covered = candidacies.filter((c) => hasMeasures(c, theme.id)).length;
  return (
    `Au ${formatLongDate(date)}, sur le thème « ${theme.title} », Polithèque recense les ` +
    `propositions de ${plural(covered, 'parti')} sur ${candidacies.length}, par ordre alphabétique, ` +
    `et ${plural(theme.keyFigures.length, 'chiffre clé sourcé', 'chiffres clés sourcés')}.`
  );
}
