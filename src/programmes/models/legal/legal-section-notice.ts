/**
 * Avertissement de la section « Procédures judiciaires », identique pour les dix partis.
 * Pour le retirer : passer `LEGAL_SECTION_INCOMPLETE` à `false` (seul endroit à modifier).
 */
export const LEGAL_SECTION_INCOMPLETE = true;

export const LEGAL_SECTION_NOTICE =
  "Section en cours de constitution : des procédures, notamment anciennes, sont en cours de vérification juridique et ne figurent pas encore ici. Cette liste n'est donc pas complète et ne permet pas de comparer les partis entre eux.";

export const legalSectionNotice = (): string | null =>
  LEGAL_SECTION_INCOMPLETE ? LEGAL_SECTION_NOTICE : null;
