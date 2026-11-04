import { createSelector } from 'reselect';

import type { Catalog } from '@/src/programmes/models/programme.model';
import type { PageMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

/** Métadonnées d'une page sans view-model propre (accueil, rubriques, questionnaire). */
export const pageMetaViewModel = (build: (catalog: Catalog) => PageMeta) => () =>
  createSelector([selectCatalog], (catalog): PageMeta | null => (catalog ? build(catalog) : null));
