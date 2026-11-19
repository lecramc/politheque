import {
  CANDIDATE_PROGRAMME_LABELS,
  CANDIDATE_STATUS_LABELS,
  CANDIDATES_COPY,
  DATE_NOT_FOUND,
} from '@/src/programmes/models/candidates.copy';
import { calculatedDateText } from '@/src/programmes/models/contenus-2027';
import type {
  CandidateProgrammeState,
  DeclaredCandidate,
  FaqEntry,
  Party,
  Source,
} from '@/src/programmes/models/programme.model';
import { formatLongDate, formatPartialDate } from '@/src/programmes/models/seo/dates';
import { partyHref } from '@/src/programmes/models/seo/party-sections';

/**
 * Libellé de statut commun à tous les candidats de la page, tiré du code de statut et jamais du
 * libellé propre à chaque fiche (textes dans `candidates.copy.ts`).
 */
export const UNIFORM_STATUS_LABELS = CANDIDATE_STATUS_LABELS;

/** Un candidat dans la liste : même gabarit pour tous, d'où qu'il vienne. */
export type CandidateEntry = {
  id: string;
  name: string;
  statusLabel: string;
  /** Date du statut (annonce, investiture ou désignation). */
  date: string | null;
  /** « Date d'annonce non retrouvée » quand la date est absente. */
  dateNote: string | null;
  affiliation: string;
  role: string | null;
  summary: string;
  /** Lien « Programme et positions » : seulement pour les candidats des fiches de partis. */
  programmeHref: string | null;
  /** Site de campagne, ou à défaut du mouvement ou du parti. */
  officialSiteHref: string | null;
  /** Fiche nominative sur le site de la HATVP, si elle existe. */
  hatvpHref: string | null;
  /** État du programme 2027 officiel ; `href` seulement s'il est publié (en tout ou partie). */
  programme: { label: string; href: string | null };
  sources: Source[];
};

const programmeOf = (state: CandidateProgrammeState, url?: string) => ({
  label: CANDIDATE_PROGRAMME_LABELS[state],
  href: (state === 'publie' || state === 'partiel') && url ? url : null,
});

const fromParty = (party: Party, electionId: string): CandidateEntry[] => {
  const candidacy = party.candidacies[electionId];
  return candidacy
    ? [
        {
          id: party.id,
          name: candidacy.candidateName,
          statusLabel: UNIFORM_STATUS_LABELS[candidacy.status],
          date: candidacy.candidateDate ?? null,
          dateNote: candidacy.candidateDate ? null : DATE_NOT_FOUND,
          affiliation: party.name,
          role: null,
          summary: candidacy.candidateSummary ?? candidacy.candidate,
          programmeHref: partyHref(party.id, 'programme'),
          officialSiteHref: candidacy.officialSite ?? null,
          hatvpHref: candidacy.hatvp ?? null,
          programme: programmeOf(candidacy.programmeState, candidacy.programmeUrl),
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
  dateNote: c.date ? null : DATE_NOT_FOUND,
  affiliation: c.affiliation,
  role: c.role || null,
  summary: c.summary,
  programmeHref: null,
  officialSiteHref: c.officialSite ?? null,
  hatvpHref: c.hatvp ?? null,
  programme: programmeOf(c.programme.state, c.programme.url),
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

export const SPONSORSHIP_FAQ_ID = 'parrainages';

/**
 * Phrase de contexte : la date limite des parrainages vient de la date calculée de la FAQ ; si elle
 * manque, la clause est omise (jamais une date saisie ici).
 */
export function candidatesIntro(faq: FaqEntry[]): string {
  const base = CANDIDATES_COPY.introBase;
  const deadline = faq.find((q) => q.id === SPONSORSHIP_FAQ_ID)?.calculated?.[0];
  return deadline
    ? CANDIDATES_COPY.introWithDeadline(base, calculatedDateText(deadline))
    : `${base}.`;
}

/** Chapô de la page : ce qu'on attend et ce que la page montre en attendant (texte dans `candidates.copy.ts`). */
export const CANDIDATES_PAGE_INTRO = CANDIDATES_COPY.pageIntro;

/** Note en petit : la date limite calculée de la FAQ ; rien si la donnée manque (jamais une date saisie ici). */
export function candidatesDeadlineNote(faq: FaqEntry[]): string | null {
  const deadline = faq.find((q) => q.id === SPONSORSHIP_FAQ_ID)?.calculated?.[0];
  return deadline ? CANDIDATES_COPY.deadlineNote(calculatedDateText(deadline)) : null;
}

/** Règle d'affichage, identique pour tous les candidats. */
export const candidatesRule = (lastVerified: string): string =>
  CANDIDATES_COPY.rule(formatLongDate(lastVerified));

/** « Retrait le 7 juillet 2026 » ou, si seul le mois est établi, « Retrait en septembre 2026 ». */
export const withdrawalLabel = (date: string): string =>
  CANDIDATES_COPY.withdrawal(/^\d{4}-\d{2}$/.test(date) ? 'en' : 'le', formatPartialDate(date));
