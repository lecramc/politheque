import type {
  AssembleeManifest,
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';
import { rootReducers, type AppState } from '@/src/core/store/create-store';

const initial = (): AppState => rootReducers(undefined, { type: '@@test/init' });

/** État initial des tests de l'Assemblée : l'état réel des reducers, puis ce qui compte. */
export const assembleeStateBuilder = (state: AppState = initial()) => {
  const next = (patch: Partial<AppState['assemblee']>) =>
    assembleeStateBuilder({ ...state, assemblee: { ...state.assemblee, ...patch } });
  return {
    withIndex: (index: ScrutinIndex) => next({ index }),
    withManifest: (manifest: AssembleeManifest) => next({ manifest }),
    withDetail: (detail: ScrutinDetail) =>
      next({
        details: {
          ...state.assemblee.details,
          [detail.numero]: { status: 'loaded', data: detail },
        },
      }),
    withDeputes: (data: DeputeDirectory) => next({ deputes: { status: 'loaded', data } }),
    build: (): AppState => state,
  };
};
