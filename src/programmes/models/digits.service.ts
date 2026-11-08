export interface DigitRun {
  text: string;
  digits: boolean;
}

/**
 * Coupe un texte en séries de chiffres (séparateurs d'espace et décimaux compris) et en texte
 * courant. Atkinson Hyperlegible barre le zéro : pour les dates et les grands chiffres, les séries
 * de chiffres passent dans la police des titres, qui n'a pas de barre.
 */
export const splitDigits = (text: string): DigitRun[] =>
  (text.match(/\d+(?:[\s.,]\d+)*|\D+/g) ?? []).map((run) => ({
    text: run,
    digits: /^\d/.test(run),
  }));

const MONTHS =
  'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
// Une année (1900-2099) isolée, ou un quantième (1er, 1 à 31) suivi d'un nom de mois.
const DATE_PART = new RegExp(
  `\\b(?:19|20)\\d{2}\\b|\\b(?:1er|\\d{1,2})(?= (?:${MONTHS})\\b)`,
  'gi'
);

/**
 * Comme `splitDigits`, mais seulement pour les dates : années et quantièmes. Les autres nombres
 * (âges, montants, durées) restent dans la police du texte courant.
 */
export const splitDates = (text: string): DigitRun[] => {
  const runs: DigitRun[] = [];
  let last = 0;
  for (const match of text.matchAll(DATE_PART)) {
    const start = match.index ?? 0;
    // « 1er » : seul le chiffre passe dans la police des titres, pas le suffixe.
    const digits = match[0].replace(/er$/i, '');
    if (start > last) runs.push({ text: text.slice(last, start), digits: false });
    runs.push({ text: digits, digits: true });
    last = start + digits.length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), digits: false });
  return runs.reduce<DigitRun[]>((merged, run) => {
    const previous = merged[merged.length - 1];
    if (previous && previous.digits === run.digits) previous.text += run.text;
    else merged.push({ ...run });
    return merged;
  }, []);
};

const ISOLATED_NUMBER = /^(?:J-)?\d+(?:[\s.,]\d+)*(?:\s?%)?$/;

/**
 * Vrai pour un libellé composé uniquement d'un nombre (compteur, pourcentage, « J-n ») : seul cas,
 * hors titres, où les chiffres passent dans la police des titres. Dans une phrase, on garde la
 * police du texte courant d'un bout à l'autre, zéro barré compris.
 */
export const isIsolatedNumber = (text: string): boolean => ISOLATED_NUMBER.test(text.trim());
