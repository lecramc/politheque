// Typographie française : espaces insécables avant la ponctuation haute et autour des guillemets.

const NBSP = '\u00A0';
const NARROW_NBSP = '\u202F';

// Une URL n'est jamais modifiée.
const URL_PATTERN = /(https?:\/\/\S+|www\.\S+)/g;

const fixSegment = (text: string): string =>
  text
    .replace(/[ \u00A0]+([;?!])/g, `${NARROW_NBSP}$1`)
    .replace(/[ \u00A0]+:/g, `${NBSP}:`)
    .replace(/[ \u00A0]+»/g, `${NBSP}»`)
    .replace(/«[ \u00A0]+/g, `«${NBSP}`);

/** Remplace les espaces ordinaires par des insécables là où le français l'exige. */
export function frenchTypography(text: string): string {
  return text
    .split(URL_PATTERN)
    .map((part, index) => (index % 2 === 1 ? part : fixSegment(part)))
    .join('');
}
