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

const VOWEL = /^[aeiouyhàâäéèêëîïôöùûü]/i;

/** « du Parti communiste français », « des Républicains », « de La France insoumise », « d'Horizons ». */
export const ofParty = (name: string): string => {
  if (/^Les /.test(name)) return `des ${name.slice(4)}`;
  if (/^Le /.test(name)) return `du ${name.slice(3)}`;
  if (/^(La |L')/.test(name)) return `de ${name}`;
  // Nom commun en tête, sans article dans le nom officiel : on emploie l'article (« du Parti… »).
  if (/^(Parti|Rassemblement|Mouvement|Front|Centre|Nouveau)\b/.test(name)) return `du ${name}`;
  return VOWEL.test(name) ? `d'${name}` : `de ${name}`;
};

/** « à l'élection… », « aux élections… ». */
const toThe = (phrase: string) =>
  phrase
    .replace(/^les /, 'aux ')
    .replace(/^le /, 'au ')
    .replace(/^l'/, "à l'")
    .replace(/^la /, 'à la ');

const ELECTION_NAMES: Record<ElectionType, string> = {
  presidentielle: "l'élection présidentielle",
  legislatives: 'les élections législatives',
  europeennes: 'les élections européennes',
  municipales: 'les élections municipales',
  senatoriales: 'les élections sénatoriales',
  regionales: 'les élections régionales',
  departementales: 'les élections départementales',
};

/** « l'élection présidentielle de 2027 » (année du premier tour). */
export const electionPhrase = (election: Pick<Election, 'type' | 'rounds'>) =>
  `${ELECTION_NAMES[election.type]} de ${election.rounds[0]?.date.slice(0, 4) ?? ''}`.trim();

const hasMeasures = (candidacy: Candidacy, themeId: ThemeId) =>
  (candidacy.themes[themeId]?.measures.length ?? 0) > 0;

/** Le libellé de statut est accordé dans les données (charte, règle 4) : il donne le genre. */
const isFeminine = (statusLabel: string) => /^Candidate\b/.test(statusLabel);

/** Proposition principale, selon le statut (charte, règle 4). */
const candidacyClause = (candidacy: Candidacy, party: string, election: string): string => {
  const name = candidacy.candidateName;
  const f = isFeminine(candidacy.statusLabel);
  const theCandidate = f ? 'la candidate' : 'le candidat';
  switch (candidacy.status) {
    case 'declare':
      return `${name} est ${theCandidate} ${f ? 'déclarée' : 'déclaré'} ${ofParty(party)} pour ${election}`;
    case 'investi':
      return `${name} est ${theCandidate} ${f ? 'investie' : 'investi'} ${ofParty(party)} pour ${election}`;
    case 'designe':
      return `${name} est ${theCandidate} ${f ? 'désignée' : 'désigné'} ${ofParty(party)} pour ${election}, avant un vote des adhérents`;
    case 'annonce':
      return `${name} a annoncé sa candidature ${toThe(election)} pour ${party}, sans l'avoir encore déclarée formellement`;
    case 'pressenti':
      return `${name} est ${f ? 'pressentie' : 'pressenti'} comme ${f ? 'candidate' : 'candidat'} ${ofParty(party)} pour ${election}`;
  }
};

/**
 * « Au 3 novembre 2026, Marine Le Pen est la candidate déclarée du Rassemblement national (RN) pour
 * l'élection présidentielle de 2027 ; ses propositions sont recensées dans 9 thèmes sur 9. »
 * Sans candidature : « Au …, aucune candidature du … n'est recensée pour l'élection … »
 */
export function partySummary({
  party,
  candidacy,
  electionTitle,
  themeIds,
}: {
  party: Pick<Party, 'name' | 'shortName' | 'lastVerified'>;
  candidacy: Candidacy | null;
  /** « l'élection présidentielle de 2027 » (`electionPhrase`). */
  electionTitle: string;
  themeIds: ThemeId[];
}): string {
  const date = `Au ${formatLongDate(party.lastVerified)}`;
  const label = partyLabel(party);
  if (!candidacy) {
    return `${date}, aucune candidature ${ofParty(label)} n'est recensée pour ${electionTitle}.`;
  }
  const covered = themeIds.filter((id) => hasMeasures(candidacy, id)).length;
  return (
    `${date}, ${candidacyClause(candidacy, label, electionTitle)} ; ` +
    `ses propositions sont recensées dans ${plural(covered, 'thème')} sur ${themeIds.length}.`
  );
}

/**
 * « Au 3 novembre 2026, Polithèque présente les propositions des 10 partis sur le thème « Économie,
 * impôts et dette », par ordre alphabétique, avec 4 chiffres clés sourcés. »
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
  const parties =
    covered === candidacies.length
      ? `des ${plural(covered, 'parti')}`
      : `de ${plural(covered, 'parti')} sur ${candidacies.length}`;
  return (
    `Au ${formatLongDate(date)}, Polithèque présente les propositions ${parties} sur le thème ` +
    `« ${theme.title} », par ordre alphabétique, avec ` +
    `${plural(theme.keyFigures.length, 'chiffre clé sourcé', 'chiffres clés sourcés')}.`
  );
}
