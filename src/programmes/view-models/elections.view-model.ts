import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { candidatesOf, daysUntil, nextRound } from '@/src/programmes/models/election.service';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import { electionMeta, nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const electionsViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    elections: catalog?.elections ?? [],
  }));

export const electionViewModel =
  (electionId: string, now: Date = new Date()) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
      const election = catalog?.elections.find((e) => e.id === electionId) ?? null;
      const round = election ? nextRound(election, now) : null;
      return {
        status,
        election,
        meta: election && catalog ? electionMeta(election, catalog) : null,
        notFoundMeta: nonIndexableMeta('Élection introuvable', `/elections/${electionId}`),
        markRead: () => dispatch(markContentReadUsecase(contentKey.election(electionId))),
        daysLeft: round ? daysUntil(round.date, now) : null,
        round,
        candidates: election ? candidatesOf(election, catalog?.parties ?? []) : [],
        guideSections: election
          ? (catalog?.guide ?? []).filter((s) => election.guideSectionIds.includes(s.id))
          : [],
        themes: catalog?.themes ?? [],
      };
    });
