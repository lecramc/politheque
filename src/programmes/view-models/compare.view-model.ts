import { createSelector } from 'reselect';

import { compareParties } from '@/src/programmes/models/compare.service';
import { compareMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

/**
 * « Comparer deux partis » : aucune paire par défaut, parti A à gauche dans l'ordre du choix, aucun
 * score ni nombre d'accords. Les deux partis viennent de l'URL (`?a=&b=`), lue côté client ; `?theme=` ouvre la comparaison sur un thème.
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
    themeIds: (catalog?.themes ?? []).map((theme) => theme.id),
    /** Adresse de la comparaison : paire (`a`, `b`) et thème ouvert (`theme`), tous facultatifs. */
    linkFor: (aId: string | null, bId: string | null, themeId?: string | null) => {
      const query = [
        aId ? `a=${aId}` : null,
        aId && bId ? `b=${bId}` : null,
        themeId ? `theme=${themeId}` : null,
      ].filter(Boolean);
      return `/partis/comparer${query.length ? `?${query.join('&')}` : ''}`;
    },
  }));
