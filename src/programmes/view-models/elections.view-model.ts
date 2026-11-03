import { createSelector } from 'reselect';

import { candidatesOf, daysUntil, nextRound } from '@/src/programmes/models/election.service';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export const electionsViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    elections: catalog?.elections ?? [],
  }));

export const electionViewModel =
  (electionId: string, now: Date = new Date()) =>
  () =>
    createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
      const election = catalog?.elections.find((e) => e.id === electionId) ?? null;
      const round = election ? nextRound(election, now) : null;
      return {
        status,
        election,
        daysLeft: round ? daysUntil(round.date, now) : null,
        round,
        candidates: election ? candidatesOf(election, catalog?.parties ?? []) : [],
        guideSections: election
          ? (catalog?.guide ?? []).filter((s) => election.guideSectionIds.includes(s.id))
          : [],
        themes: catalog?.themes ?? [],
      };
    });
