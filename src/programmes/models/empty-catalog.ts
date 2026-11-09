import type { Catalog } from '@/src/programmes/models/programme.model';

/** Catalogue vide : valeur de repli avant chargement, et base du gateway factice. */
export const emptyCatalog = (): Catalog => ({
  parties: [],
  elections: [],
  themes: [],
  questions: [],
  axes: [],
  guide: [],
  lexicon: [],
  faq: [],
  voter: {
    id: '',
    title: '',
    summary: '',
    summarySources: [],
    guideSectionId: '',
    electionId: '',
    lastVerified: '',
    sections: [],
  },
  corrections: [],
  legal: [],
});
