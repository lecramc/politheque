import { createSelector } from 'reselect';

import { candidatesOf, daysUntil, nextRound } from '@/src/programmes/models/election.service';
import {
  selectCatalog,
  selectCatalogStatus,
  selectFeaturedElection,
} from '@/src/programmes/store/programmes.selector';

export const homeViewModel =
  (now: Date = new Date()) =>
  () =>
    createSelector(
      [selectCatalog, selectCatalogStatus, selectFeaturedElection],
      (catalog, status, election) => {
        const round = election ? nextRound(election, now) : null;
        return {
          status,
          featured: election
            ? {
                election,
                round,
                daysLeft: round ? daysUntil(round.date, now) : null,
                candidates: candidatesOf(election, catalog?.parties ?? []),
              }
            : null,
          guide: catalog?.guide ?? [],
          themes: catalog?.themes ?? [],
          partyCount: catalog?.parties.length ?? 0,
          questionCount: catalog?.questions.length ?? 0,
        };
      }
    );
