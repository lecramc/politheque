import { createSelector } from 'reselect';

import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { compositionScene, compositionSummary } from '@/src/assemblee/models/composition';
import { MAJOR_VOTES_LEGEND, majorVotesGrid } from '@/src/assemblee/models/major-votes';
import {
  selectAssembleeComposition,
  selectAssembleeIndex,
  selectAssembleeManifest,
} from '@/src/assemblee/store/assemblee.selector';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

/** Leçon du guide « Comprendre » sur le vote d'une loi : l'encart n'apparaît que si elle existe. */
export const LAW_LESSON_ID = 'comment-une-loi-est-votee';

/**
 * Vue d'ensemble en haut de `/assemblee` : qui siège aujourd'hui, qui vote quoi sur les grands
 * votes, l'entrée vers la leçon sur la loi. Tout vient des données embarquées (aucun chargement) ;
 * mêmes règles pour tous les groupes, aucun classement.
 */
export const assembleeOverviewViewModel = () =>
  createSelector(
    [selectAssembleeIndex, selectAssembleeManifest, selectAssembleeComposition, selectCatalog],
    (index, manifest, composition, catalog) => {
      const sittingCopy = COPY.overview.sitting;
      const gridCopy = COPY.overview.grid;
      const summary = index && composition ? compositionSummary(composition, index.groupes) : null;
      const grid = index ? majorVotesGrid(index) : null;
      const lawCopy = COPY.overview.law;
      return {
        status: index && composition && manifest ? ('loaded' as const) : ('loading' as const),
        sitting:
          index && composition && summary
            ? {
                title: sittingCopy.title,
                lead: sittingCopy.lead(manifest ? formatLongDate(manifest.extraitLe) : ''),
                ...summary,
                chartLabel: sittingCopy.chartLabel(summary.total, summary.rows.length),
                note: sittingCopy.note,
                listLabel: sittingCopy.listLabel,
                scene: compositionScene(summary.rows, index.groupes),
              }
            : null,
        grid:
          grid && grid.columns.length > 0
            ? {
                title: gridCopy.title,
                lead: gridCopy.lead(grid.columns.length),
                note: gridCopy.note,
                shared: gridCopy.shared,
                groupHeader: gridCopy.group,
                caption: gridCopy.caption,
                legend: MAJOR_VOTES_LEGEND,
                open: gridCopy.open,
                cellLabel: gridCopy.cell,
                ...grid,
              }
            : null,
        law: catalog?.guide.some((section) => section.id === LAW_LESSON_ID)
          ? {
              title: lawCopy.title,
              text: lawCopy.text,
              cta: lawCopy.cta,
              href: `/comprendre/${LAW_LESSON_ID}`,
            }
          : null,
        allVotesTitle: COPY.overview.allVotes.title,
      };
    }
  );
