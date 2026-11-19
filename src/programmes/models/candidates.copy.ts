import type {
  CandidacyStatus,
  CandidateProgrammeState,
  DeclaredCandidateStatus,
} from '@/src/programmes/models/programme.model';

/** Libellé de l'état du programme 2027 : identique pour tous les candidats. */
export const CANDIDATE_PROGRAMME_LABELS: Record<CandidateProgrammeState, string> = {
  publie: 'Programme 2027 publié',
  partiel: 'Programme 2027 publié en partie',
  'non-publie': 'Programme 2027 pas encore publié',
  inconnu: 'Programme 2027 : aucune information trouvée',
};

/** Libellés des liens sortants de chaque entrée. */
export const CANDIDATE_LINK_LABELS = {
  officialSite: 'Site de campagne ou du parti',
  programme: 'Lire le programme',
  hatvp: 'Fiche HATVP',
} as const;

/** Affiché quand la date de l'annonce n'a pas été retrouvée : jamais une date supposée. */
export const DATE_NOT_FOUND = "Date d'annonce non retrouvée";

/**
 * Parrainages : règles de la loi n° 62-1292 du 6 novembre 1962 (art. 3, Légifrance) ; la date limite
 * est celle, calculée et sourcée, de la FAQ (voir `candidatesDeadlineNote`). Aucune date de
 * publication : le Conseil constitutionnel n'en a annoncé aucune pour 2027.
 */
export const SPONSORSHIP_NOTE =
  'Le Conseil constitutionnel publie les noms des parrains au moins deux fois par semaine, puis arrête la liste officielle des candidats (loi n° 62-1292 du 6 novembre 1962, article 3).';

/** Libellé de statut, le même pour tous les candidats, sans accord (10 partis comme les autres). */
export const CANDIDATE_STATUS_LABELS: Record<CandidacyStatus | DeclaredCandidateStatus, string> = {
  declare: 'Candidature déclarée',
  annonce: 'Candidature annoncée',
  intention: 'Intention de candidature annoncée',
  investi: 'Investiture par son parti',
  designe: 'Désignation par son parti',
  pressenti: 'Candidature envisagée',
};

/** Phrases de la page des candidats ; les dates sont déjà formatées par le service. */
export const CANDIDATES_COPY = {
  introBase:
    'La liste officielle des candidats sera publiée par le Conseil constitutionnel après le dépôt des 500 parrainages',
  introWithDeadline: (base: string, deadline: string) =>
    `${base}, possible jusqu'au ${deadline} (date calculée, à confirmer par le décret de convocation).`,
  /** Chapô : ce qu'on attend et ce que la page montre en attendant, sans date ni jargon. */
  pageIntro:
    "La liste officielle sera publiée par le Conseil constitutionnel une fois vérifiées les 500 signatures d'élus que chaque candidat doit réunir. En attendant, voici les candidatures annoncées publiquement.",
  deadlineNote: (deadline: string) =>
    `Date limite de dépôt des parrainages : ${deadline} (date calculée, à confirmer par le décret de convocation).`,
  rule: (lastVerified: string) =>
    `Candidatures déclarées ou annoncées publiquement, attestées par au moins deux sources ; mise à jour le ${lastVerified}.`,
  withdrawal: (preposition: 'en' | 'le', date: string) => `Retrait ${preposition} ${date}`,
} as const;
