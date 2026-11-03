import { createSelector } from 'reselect';

import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export const partiesViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    // Ordre alphabétique : aucune hiérarchie implicite entre les partis.
    parties: [...(catalog?.parties ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  }));
