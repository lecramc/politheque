import {
  combineReducers,
  configureStore,
  Middleware,
  StoreEnhancer,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { uiSlice } from '@/src/core/store/ui.slice';
import type { ProgrammeGateway } from '@/src/programmes/gateways/programme.gateway';
import type { ReadingProgressGateway } from '@/src/programmes/gateways/reading-progress.gateway';
import { programmesSlice } from '@/src/programmes/store/programmes.slice';
import { quizSlice } from '@/src/programmes/store/quiz.slice';
import { readingSlice } from '@/src/programmes/store/reading.slice';

export const rootReducers = combineReducers({
  programmes: programmesSlice.reducer,
  quiz: quizSlice.reducer,
  reading: readingSlice.reducer,
  ui: uiSlice.reducer,
});

export type Dependencies = {
  programmeGateway: ProgrammeGateway;
  readingProgressGateway: ReadingProgressGateway;
};
export type PreloadedState = Record<string, unknown>;
export type AppState = ReturnType<typeof rootReducers>;
export type AppStore = Omit<ReturnType<typeof createStore>, 'getActions'>;

export const createStore = (config: {
  dependencies: Dependencies;
  initialState?: AppState;
  enhancers?: StoreEnhancer[];
}) => {
  const actions: unknown[] = [];

  const logActionsMiddleware: Middleware = () => (next) => (action) => {
    actions.push(action);
    if (actions.length > 200) actions.shift();
    return next(action);
  };
  const store = configureStore({
    preloadedState: config.initialState,
    reducer: rootReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: config.dependencies,
        },
      }).prepend(logActionsMiddleware),
    devTools: false,
    enhancers: config.enhancers?.length
      ? (getDefaultEnhancers) =>
          getDefaultEnhancers().concat(...(config.enhancers as StoreEnhancer[]))
      : undefined,
  });
  return {
    ...store,
    getActions() {
      return actions;
    },
  };
};

export type AppDispatch = ThunkDispatch<AppState, Dependencies, UnknownAction>;
export const appDispatch = useDispatch<AppDispatch>;
export const appSelector = useSelector.withTypes<AppState>();
