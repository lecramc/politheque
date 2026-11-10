import { createSelector } from 'reselect';

import { t } from '@/src/assemblee/i18n/translate';
import { ARTICLE_49_SOURCE_URL } from '@/src/assemblee/models/article-49-3';
import {
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
  categoryLabel,
  countsLabel,
  resultLabel,
} from '@/src/assemblee/models/scrutin-labels';
import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import { OFFICIAL_LIST_URL, sourceNote } from '@/src/assemblee/models/source-note';
import {
  selectAssembleeIndex,
  selectAssembleeManifest,
} from '@/src/assemblee/store/assemblee.selector';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { assembleeListMeta } from '@/src/programmes/models/seo/page-meta';

export type ScrutinRow = {
  numero: number;
  href: string;
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
  dateIso: s.date,
  date: formatLongDate(s.date),
  categorie: categoryLabel(s.categorie),
  titre: capitalizeTitle(s.titre),
  resultat: resultLabel(s),
  adopte: s.adopte,
  decompte: countsLabel(s),
});

/**
 * `/assemblee` : la liste complète, du plus récent au plus ancien, groupée par mois. Les filtres
 * (catégorie, résultat, année, titre) viennent de l'adresse, lue côté client : le HTML pré-rendu
 * est la liste entière. Aucun classement, aucun score.
 */
export const assembleeListViewModel = () =>
  createSelector([selectAssembleeIndex, selectAssembleeManifest], (index, manifest) => {
    const all = index?.scrutins ?? [];
    return {
      status: index && manifest ? ('loaded' as const) : ('loading' as const),
      meta: index ? assembleeListMeta(index) : null,
      warning: t('list.warning'),
      criteria: {
        lead: t('list.criteriaLead'),
        rules: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map((id) => t(`method.${id}`)),
        excluded: t('list.criteriaExcluded'),
      },
      article493: {
        text: t('notes.article493'),
        sourceLabel: t('notes.article493Source'),
        sourceUrl: ARTICLE_49_SOURCE_URL,
      },
      officialListUrl: OFFICIAL_LIST_URL,
      source: manifest ? sourceNote(manifest) : null,
      years: yearsOf(all),
      categories: CATEGORIES.filter((c) => all.some((s) => s.categorie === c)).map((id) => ({
        id,
        label: categoryLabel(id),
      })),
      list: (filters: ListFilters) => {
        const shown = sortByMostRecent(filterScrutins(all, toScrutinFilters(filters)));
        return {
          count: shown.length,
          total: all.length,
          months: groupByMonth(shown).map((month) => ({
            mois: month.mois,
            libelle: capitalizeTitle(month.libelle),
            rows: month.scrutins.map(toRow),
          })),
        };
      },
    };
  });
