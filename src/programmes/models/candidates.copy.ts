import type { CandidateProgrammeState } from '@/src/programmes/models/programme.model';

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
