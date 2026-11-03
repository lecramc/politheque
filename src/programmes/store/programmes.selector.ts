import { createSelector } from 'reselect';

import type { AppState } from '@/src/core/store/create-store';
import type { Answers } from '@/src/programmes/models/matching.service';

export const selectCatalog = (state: AppState) => state.programmes.catalog;
export const selectCatalogStatus = (state: AppState) => state.programmes.status;
export const selectQuiz = (state: AppState) => state.quiz;

export const selectFeaturedElection = (state: AppState) =>
  state.programmes.catalog?.elections.find((e) => e.featured) ?? null;

export const selectReadIds = (state: AppState) => state.reading.readIds;

/** Réponses données (y compris « pas d'avis »), avec leur importance. */
export const selectAnswers = createSelector(
  [selectQuiz],
  (quiz): Answers =>
    Object.fromEntries(
      Object.entries(quiz.values).map(([id, value]) => [
        id,
        { value, important: !!quiz.important[id] },
      ])
    )
);
