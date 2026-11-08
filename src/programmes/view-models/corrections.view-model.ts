import { createSelector } from 'reselect';

import {
  CORRECTION_KIND_LABELS,
  type CorrectionEntry,
} from '@/src/programmes/models/corrections/corrections.model';
import { groupByMonth, pageLabels } from '@/src/programmes/models/corrections/corrections.service';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { allPageMetas, correctionsMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export type PresentedCorrection = {
  id: string;
  dateLabel: string;
  kindLabel: string;
  summary: string;
  pages: { path: string; label: string }[];
};

export const correctionsViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
    const entries: CorrectionEntry[] = catalog?.corrections ?? [];
    const labels = catalog && entries.length ? pageLabels(allPageMetas(catalog)) : {};
    return {
      status,
      meta: correctionsMeta(),
      isEmpty: entries.length === 0,
      months: groupByMonth(entries).map((month) => ({
        key: month.key,
        label: month.label,
        entries: month.entries.map(
          (e): PresentedCorrection => ({
            id: e.id,
            dateLabel: formatLongDate(e.date),
            kindLabel: CORRECTION_KIND_LABELS[e.kind],
            summary: e.summary,
            pages: e.pages.map((path) => ({
              path,
              label: labels[path] ?? labels[`${path}/programme-2027`] ?? path,
            })),
          })
        ),
      })),
    };
  });
