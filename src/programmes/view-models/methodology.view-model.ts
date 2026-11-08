import { createSelector } from 'reselect';

import { readingGuideSections } from '@/src/programmes/models/reading-guides.copy';
import { methodSentences } from '@/src/programmes/models/results.copy';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

export const methodologyViewModel = () =>
  createSelector([selectCatalog], (catalog) => ({
    methodSentences: methodSentences(catalog?.questions.length ?? 0),
    readingGuides: readingGuideSections(
      catalog?.questions.length ?? 0,
      catalog?.parties.length ?? 0
    ),
  }));
