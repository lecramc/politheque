import { createSelector } from 'reselect';

import { compareParties } from '@/src/programmes/models/compare.service';
import { compareMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

/**
 * « Comparer deux partis » : aucune paire par défaut, parti A à gauche dans l'ordre du choix, aucun
 * score ni nombre d'accords. Les deux partis viennent de l'URL (`?a=&b=`), lue côté client.
 */
export const compareViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    meta: catalog ? compareMeta(catalog) : null,
    options: [...(catalog?.parties ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      .map((party) => ({
        id: party.id,
        name: party.name,
        shortName: party.shortName,
        color: party.color,
      })),
    compare: (aId: string | null, bId: string | null) =>
      catalog && aId && bId ? compareParties(catalog, aId, bId) : null,
    linkFor: (aId: string | null, bId: string | null) =>
      `/partis/comparer${aId ? `?a=${aId}${bId ? `&b=${bId}` : ''}` : ''}`,
  }));
