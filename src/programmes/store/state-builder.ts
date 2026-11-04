import { rootReducers, type AppState } from '@/src/core/store/create-store';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import type { Catalog } from '@/src/programmes/models/programme.model';
import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';
import type { ProgressState } from '@/src/programmes/store/progress.slice';

const initial = (): AppState => rootReducers(undefined, { type: '@@test/init' });

/** État initial des tests : on part de l'état réel des reducers, puis on fixe ce qui compte. */
export const stateBuilder = (state: AppState = initial()) => {
  const next = (patch: Partial<AppState>) => stateBuilder({ ...state, ...patch });
  return {
    withCatalog: (catalog: Catalog) => next({ programmes: { status: 'loaded', catalog } }),
    withEntries: (entries: ReadingEntries) => next({ progress: { ...state.progress, entries } }),
    withProgressStatus: (status: ProgressState['status']) =>
      next({ progress: { ...state.progress, status } }),
    withCelebrations: (celebrations: ProgressState['celebrations']) =>
      next({ progress: { ...state.progress, celebrations } }),
    withQuizValues: (values: Record<string, AnswerValue>) =>
      next({ quiz: { ...state.quiz, values } }),
    build: (): AppState => state,
  };
};
