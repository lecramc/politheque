import { calculatedDateText } from '@/src/programmes/models/contenus-2027';
import type {
  CandidacyStatus,
  DeclaredCandidate,
  DeclaredCandidateStatus,
  FaqEntry,
  Party,
  Source,
} from '@/src/programmes/models/programme.model';
import { formatLongDate, formatPartialDate } from '@/src/programmes/models/seo/dates';
import { partyHref } from '@/src/programmes/models/seo/party-sections';

/**
 * Libellé de statut commun à tous les candidats de la page, tiré du code de statut et jamais du
 * libellé propre à chaque fiche : même formulation, sans accord, pour les 10 partis comme pour les autres.
 */
export const UNIFORM_STATUS_LABELS: Record<CandidacyStatus | DeclaredCandidateStatus, string> = {
  declare: 'Candidature déclarée',
  annonce: 'Candidature annoncée',
  intention: 'Intention de candidature annoncée',
  investi: 'Investiture par son parti',
  designe: 'Désignation par son parti',
  pressenti: 'Candidature envisagée',
};

/** Un candidat dans la liste : même gabarit pour tous, d'où qu'il vienne. */
export type CandidateEntry = {
  id: string;
  name: string;
  statusLabel: string;
  /** Date du statut (annonce, investiture ou désignation). */
  date: string | null;
  affiliation: string;
  role: string | null;
  summary: string;
  /** Lien « Programme et positions » : seulement pour les candidats des fiches de partis. */
  programmeHref: string | null;
  sources: Source[];
};

const fromParty = (party: Party, electionId: string): CandidateEntry[] => {
  const candidacy = party.candidacies[electionId];
  return candidacy
    ? [
        {
          id: party.id,
          name: candidacy.candidateName,
          statusLabel: UNIFORM_STATUS_LABELS[candidacy.status],
          date: candidacy.candidateDate ?? null,
          affiliation: party.name,
          role: null,
          summary: candidacy.candidateSummary ?? candidacy.candidate,
          programmeHref: partyHref(party.id, 'programme'),
          // Sources du statut de candidature, jamais celles du programme.
          sources: candidacy.candidateSources ?? [],
        },
      ]
    : [];
};

const fromOther = (c: DeclaredCandidate): CandidateEntry => ({
  id: c.id,
  name: c.name,
  statusLabel: UNIFORM_STATUS_LABELS[c.status],
  date: c.date,
  affiliation: c.affiliation,
  role: c.role || null,
  summary: c.summary,
  programmeHref: null,
  sources: c.sources,
});

const PARTICLES = new Set(['le', 'la', 'les', 'de', 'du', 'des', "d'", 'van', 'von']);
/** Particules de liaison écartées du classement (« de Villepin » se range à V, « Le Pen » à L). */
const DROPPED = new Set(['de', 'du', 'des', "d'"]);

/** Nom de famille : dernier mot, étendu aux particules qui le précèdent (« Le Pen », « de Villepin »). */
export function familyNameOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  let start = words.length - 1;
  while (start > 0 && PARTICLES.has(words[start - 1].toLowerCase())) start -= 1;
  return words.slice(start).join(' ');
}

/** Clé de tri : nom de famille sans particule de liaison. */
export const sortKeyOf = (fullName: string): string =>
  familyNameOf(fullName)
    .split(' ')
    .filter((word, index) => index > 0 || !DROPPED.has(word.toLowerCase()))
    .join(' ');

const byFamilyName = (a: CandidateEntry, b: CandidateEntry) =>
  sortKeyOf(a.name).localeCompare(sortKeyOf(b.name), 'fr') || a.name.localeCompare(b.name, 'fr');

export function buildCandidateList(
  parties: Party[],
  others: DeclaredCandidate[],
  electionId: string
): CandidateEntry[] {
  return [...parties.flatMap((p) => fromParty(p, electionId)), ...others.map(fromOther)].sort(
    byFamilyName
  );
}

const SPONSORSHIP_FAQ_ID = 'parrainages';

/**
 * Phrase de contexte : la date limite des parrainages vient de la date calculée de la FAQ ; si elle
 * manque, la clause est omise (jamais une date saisie ici).
 */
export function candidatesIntro(faq: FaqEntry[]): string {
  const base =
    'La liste officielle des candidats sera publiée par le Conseil constitutionnel après le dépôt des 500 parrainages';
  const deadline = faq.find((q) => q.id === SPONSORSHIP_FAQ_ID)?.calculated?.[0];
  return deadline
    ? `${base}, possible jusqu'au ${calculatedDateText(deadline)} (date calculée, à confirmer par le décret de convocation).`
    : `${base}.`;
}

/** Chapô de la page : ce qu'on attend et ce que la page montre en attendant, sans date ni jargon. */
export const CANDIDATES_PAGE_INTRO =
  "La liste officielle sera publiée par le Conseil constitutionnel une fois vérifiées les 500 signatures d'élus que chaque candidat doit réunir. En attendant, voici les candidatures annoncées publiquement.";

/** Note en petit : la date limite calculée de la FAQ ; rien si la donnée manque (jamais une date saisie ici). */
export function candidatesDeadlineNote(faq: FaqEntry[]): string | null {
  const deadline = faq.find((q) => q.id === SPONSORSHIP_FAQ_ID)?.calculated?.[0];
  return deadline
    ? `Date limite de dépôt des parrainages : ${calculatedDateText(deadline)} (date calculée, à confirmer par le décret de convocation).`
    : null;
}

/** Règle d'affichage, identique pour tous les candidats. */
export const candidatesRule = (lastVerified: string): string =>
  `Candidatures déclarées ou annoncées publiquement, attestées par au moins deux sources ; mise à jour le ${formatLongDate(lastVerified)}.`;

/** « Retrait le 7 juillet 2026 » ou, si seul le mois est établi, « Retrait en septembre 2026 ». */
export const withdrawalLabel = (date: string): string =>
  `Retrait ${/^\d{4}-\d{2}$/.test(date) ? 'en' : 'le'} ${formatPartialDate(date)}`;
