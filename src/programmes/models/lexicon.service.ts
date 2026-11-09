import type { LexiconEntry } from '@/src/programmes/models/programme.model';

export const LEXICON_NUMBER_GROUP = '0-9';

export type LexiconGroup = {
  /** « A »… « Z », ou « 0-9 ». */
  letter: string;
  /** Ancre du titre de groupe : `lettre-a`, `lettre-0-9`. */
  anchor: string;
  entries: LexiconEntry[];
};

const collator = new Intl.Collator('fr', { sensitivity: 'base', ignorePunctuation: true });

const letterOf = (term: string): string => {
  const first = term.normalize('NFD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : LEXICON_NUMBER_GROUP;
};

/** Termes triés (ordre alphabétique français) et regroupés par initiale ; les chiffres d'abord. */
export function lexiconGroups(entries: LexiconEntry[]): LexiconGroup[] {
  const sorted = [...entries].sort((a, b) => {
    const numberA = letterOf(a.term) === LEXICON_NUMBER_GROUP;
    const numberB = letterOf(b.term) === LEXICON_NUMBER_GROUP;
    if (numberA !== numberB) return numberA ? -1 : 1;
    return collator.compare(a.term, b.term);
  });
  const groups: LexiconGroup[] = [];
  for (const entry of sorted) {
    const letter = letterOf(entry.term);
    const last = groups[groups.length - 1];
    if (last?.letter === letter) last.entries.push(entry);
    else groups.push({ letter, anchor: `lettre-${letter.toLowerCase()}`, entries: [entry] });
  }
  return groups;
}
