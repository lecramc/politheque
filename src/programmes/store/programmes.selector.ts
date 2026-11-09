import { createSelector } from 'reselect';

import type { AppState } from '@/src/core/store/create-store';
import { emptyCatalog } from '@/src/programmes/models/empty-catalog';
import { buildJourney } from '@/src/programmes/models/journey.model';
import { computeJourneyProgress } from '@/src/programmes/models/journey.service';
import type { Answers } from '@/src/programmes/models/matching.service';
import type { Catalog } from '@/src/programmes/models/programme.model';
import {
  contentKey,
  isRead,
  parseContentKey,
} from '@/src/programmes/models/reading-progress.model';

export const selectCatalog = (state: AppState) => state.programmes.catalog;
export const selectCatalogStatus = (state: AppState) => state.programmes.status;
export const selectQuiz = (state: AppState) => state.quiz;

export const selectFeaturedElection = (state: AppState) =>
  state.programmes.catalog?.elections.find((e) => e.featured) ?? null;

const EMPTY_CATALOG: Catalog = emptyCatalog();

export const selectProgressStatus = (state: AppState) => state.progress.status;
export const selectReadingEntries = (state: AppState) => state.progress.entries;
export const selectCelebrations = (state: AppState) => state.progress.celebrations;

/** Compat : ids des sections du guide lues. */
export const selectReadIds = createSelector([selectReadingEntries], (entries) =>
  Object.keys(entries).flatMap((key) => {
    const parsed = parseContentKey(key);
    return parsed?.type === 'guide' ? [parsed.id] : [];
  })
);

export const selectJourney = createSelector([selectCatalog], (catalog) =>
  buildJourney(catalog ?? EMPTY_CATALOG)
);

export const selectJourneyProgress = createSelector(
  [selectJourney, selectReadingEntries],
  computeJourneyProgress
);

/**
 * Le questionnaire a été terminé (tampon de lecture) mais aucune réponse n'est en mémoire : les
 * réponses ne sont jamais persistées, un rechargement de la page les efface.
 */
export const selectResultsLost = createSelector(
  [selectReadingEntries, selectQuiz],
  (entries, quiz) =>
    isRead(entries, contentKey.quizDone) && Object.values(quiz.values).every((v) => v === null)
);

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
