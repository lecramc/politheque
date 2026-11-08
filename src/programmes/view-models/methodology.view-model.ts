import { createSelector } from 'reselect';

import { methodSentences } from '@/src/programmes/models/results.copy';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

export const methodologyViewModel = () =>
  createSelector([selectCatalog], (catalog) => ({
    methodSentences: methodSentences(catalog?.questions.length ?? 0),
  }));
