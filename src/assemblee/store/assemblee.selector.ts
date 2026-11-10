import type { ScrutinDetail } from '@/src/assemblee/models/scrutin.model';
import type { Resource } from '@/src/assemblee/store/assemblee.slice';
import type { AppState } from '@/src/core/store/create-store';

const IDLE = { status: 'idle' } as const;

export const selectAssembleeIndex = (state: AppState) => state.assemblee.index;
export const selectAssembleeManifest = (state: AppState) => state.assemblee.manifest;
export const selectDeputes = (state: AppState) => state.assemblee.deputes;

export const selectScrutinDetail =
  (numero: number) =>
  (state: AppState): Resource<ScrutinDetail> =>
    state.assemblee.details[numero] ?? IDLE;
