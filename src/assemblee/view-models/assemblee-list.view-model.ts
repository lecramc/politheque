import { createSelector } from 'reselect';

import { ARTICLE_49_SOURCE_URL } from '@/src/assemblee/models/article-49-3';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import {
  activeFilterCount,
  CATEGORIES,
  toScrutinFilters,
  yearsOf,
  type ListFilters,
} from '@/src/assemblee/models/filter-params';
import {
  filterScrutins,
  groupByMonth,
  sortByMostRecent,
} from '@/src/assemblee/models/scrutin-filters';
import {
  capitalizeTitle,
  categoryHelp,
  categoryLabel,
  countsLabel,
  resultLabel,
  scrutinReference,
} from '@/src/assemblee/models/scrutin-labels';
import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import { OFFICIAL_LIST_URL, sourceNote } from '@/src/assemblee/models/source-note';
import {
  selectAssembleeIndex,
  selectAssembleeManifest,
} from '@/src/assemblee/store/assemblee.selector';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { assembleeListMeta } from '@/src/programmes/models/seo/page-meta';

/** Votes affichés d'abord (le HTML pré-rendu n'en contient pas davantage), puis par tranches. */
export const LIST_PAGE_SIZE = 20;

export type ScrutinRow = {
  numero: number;
  href: string;
  /** Référence discrète : « Scrutin n° 9759 ». */
  reference: string;
  dateIso: string;
  date: string;
  categorie: string;
  titre: string;
  resultat: string;
  adopte: boolean;
  decompte: string;
};

const toRow = (s: ScrutinSummary): ScrutinRow => ({
  numero: s.numero,
  href: `/assemblee/scrutins/${s.numero}`,
  reference: scrutinReference(s.numero),
  dateIso: s.date,
  date: formatLongDate(s.date),
  categorie: categoryLabel(s.categorie),
  titre: capitalizeTitle(s.titre),
  resultat: resultLabel(s),
  adopte: s.adopte,
  decompte: countsLabel(s),
});

/**
 * `/assemblee` : les votes, du plus récent au plus ancien, groupés par mois, vingt à la fois. Les
 * filtres (type de vote, résultat, année, titre) viennent de l'adresse, lue côté client ; ils
 * s'appliquent à toute la liste, pas à la page affichée. Aucun classement, aucun score.
 */
export const assembleeListViewModel = () =>
  createSelector([selectAssembleeIndex, selectAssembleeManifest], (index, manifest) => {
    const all = index?.scrutins ?? [];
    return {
      status: index && manifest ? ('loaded' as const) : ('loading' as const),
      meta: index ? assembleeListMeta(index) : null,
      lead: COPY.list.lead,
      warning: COPY.list.warning,
      criteria: {
        title: COPY.list.criteriaTitle,
        lead: COPY.list.criteriaLead,
        rules: COPY.method.rules,
        excluded: COPY.list.criteriaExcluded,
      },
      article493: {
        text: COPY.notes.article493,
        sourceLabel: COPY.notes.article493Source,
        sourceUrl: ARTICLE_49_SOURCE_URL,
      },
      officialListUrl: OFFICIAL_LIST_URL,
      source: manifest ? sourceNote(manifest) : null,
      years: yearsOf(all),
      categories: CATEGORIES.filter((c) => all.some((s) => s.categorie === c)).map((id) => ({
        id,
        label: categoryLabel(id),
        help: categoryHelp(id),
      })),
      /** « Filtrer » ou « Filtrer · 2 » : le nombre de filtres actifs de la feuille. */
      filterButton: (filters: ListFilters) => {
        const active = activeFilterCount(filters);
        return { label: COPY.list.filters.button(active), active: active > 0 };
      },
      list: (filters: ListFilters, limit: number = LIST_PAGE_SIZE) => {
        const matching = sortByMostRecent(filterScrutins(all, toScrutinFilters(filters)));
        const left = matching.length - limit;
        return {
          count: matching.length,
          total: all.length,
          countLabel: COPY.list.count(matching.length, all.length),
          moreLabel: left > 0 ? COPY.list.more(Math.min(LIST_PAGE_SIZE, left)) : null,
          months: groupByMonth(matching.slice(0, limit)).map((month) => ({
            mois: month.mois,
            libelle: capitalizeTitle(month.libelle),
            rows: month.scrutins.map(toRow),
          })),
        };
      },
    };
  });
