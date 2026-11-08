import { createSelector } from 'reselect';

import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export const partiesViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    // Ordre alphabétique : aucune hiérarchie implicite entre les partis.
    parties: [...(catalog?.parties ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    // Les neuf grands débats : leurs adresses `/debats/[id]` ne changent pas.
    debates: (catalog?.themes ?? []).map((theme) => ({
      id: theme.id,
      title: theme.title,
      icon: theme.icon,
      href: `/debats/${theme.id}`,
    })),
    /** Sans paire choisie : les deux sélecteurs s'ouvrent vides. */
    compareHref: '/partis/comparer',
  }));
