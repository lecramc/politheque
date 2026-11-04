/**
 * Vocabulaire interdit dans les textes publics (charte, règles de rédaction) : adjectifs
 * évaluatifs et notes de travail. Liste fermée, enrichie par revue, jamais pour viser un cas.
 */
export const EVALUATIVE_TERMS = [
  'irréaliste',
  'ambitieux',
  'dangereux',
  'scandale',
  'scandaleux',
  'sulfureux',
  'retentissant',
  'accablant',
  'magouille',
  'casserole',
] as const;

/** Notes de travail et renvois aux règles internes : jamais visibles du lecteur. */
const WORK_NOTES =
  /n'a été identifié|à vérifier|sources consultées|accès bloqué|non retenu|ramenée? à null|précédemment déduite|conformément à la règle|\bTODO\b/i;

const LETTER = '[\\p{L}\\p{N}]';

/** Recherche d'un terme comme mot entier (les accents font échouer `\b`), sans tenir compte de la casse. */
export function containsTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<!${LETTER})${escaped}(?!${LETTER})`, 'iu').test(text);
}

export function findTerms(text: string, terms: readonly string[]): string[] {
  return terms.filter((term) => containsTerm(text, term));
}

export const hasWorkNote = (text: string) => WORK_NOTES.test(text);

/** « 2026-11-03 » dans un texte : les dates s'écrivent en toutes lettres. */
export const hasIsoDate = (text: string) => /\b\d{4}-\d{2}(-\d{2})?\b/.test(text);

/** Problèmes de rédaction d'un texte public, en français, pour les messages d'erreur. */
export function editorialIssues(text: string): string[] {
  return [
    ...findTerms(text, EVALUATIVE_TERMS).map((t) => `terme évaluatif « ${t} »`),
    ...(hasWorkNote(text) ? ['note de travail'] : []),
    ...(hasIsoDate(text) ? ['date ISO (écrire la date en toutes lettres)'] : []),
  ];
}
