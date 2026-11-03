// Formes courtes calculées à partir des textes sourcés : aucune nouvelle affirmation n'est écrite.

const SENTENCE_END = /(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«])/;

export const firstSentence = (text: string) => text.split(SENTENCE_END)[0]?.trim() ?? '';

/** Le texte sans sa première phrase (pour un accordéon dont la première phrase est le titre). */
export const afterFirstSentence = (text: string) =>
  text.split(SENTENCE_END).slice(1).join(' ').trim();

export const firstSentences = (text: string, count: number) =>
  text.split(SENTENCE_END).slice(0, count).join(' ').trim();

/** Retire la précision entre parenthèses : « Extrême droite (qualification…) » → « Extrême droite ». */
export const beforeParenthesis = (text: string) => text.split(' (')[0].trim();

const WORDS_PER_MINUTE = 200;

export const readingMinutes = (texts: string[]) => {
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export type GuideGroup = 'bases' | 'election' | 'approfondir';

export const GUIDE_GROUPS: { id: GuideGroup; title: string; sectionIds: string[] }[] = [
  {
    id: 'bases',
    title: 'Les bases',
    sectionIds: ['institutions', 'gauche-droite', 'classement-des-partis', 'union-europeenne'],
  },
  {
    id: 'election',
    title: "L'élection",
    sectionIds: ['election-presidentielle', 'comment-voter', 'pouvoirs-du-president'],
  },
  {
    id: 'approfondir',
    title: 'Pour aller plus loin',
    sectionIds: ['budget-dette', 'desinformation'],
  },
];
