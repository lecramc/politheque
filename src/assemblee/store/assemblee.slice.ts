import { createSlice } from '@reduxjs/toolkit';

import type {
  AssembleeManifest,
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';
import { loadDeputesUsecase } from '@/src/assemblee/usecases/load-deputes.usecase';
import { loadScrutinDetailUsecase } from '@/src/assemblee/usecases/load-scrutin-detail.usecase';
import type { AppError } from '@/src/helpers/either.type';

export type Resource<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; data: T }
  | { status: 'error'; error: string };

export type AssembleeState = {
  /** Préchargés dans le bundle (comme le catalogue) : le pré-rendu contient déjà le texte des pages. */
  index: ScrutinIndex | null;
  manifest: AssembleeManifest | null;
  details: Record<number, Resource<ScrutinDetail>>;
  deputes: Resource<DeputeDirectory>;
};

const initialState: AssembleeState = {
  index: null,
  manifest: null,
  details: {},
  deputes: { status: 'idle' },
};

const messageOf = (payload: unknown): string =>
  (payload as Partial<AppError> | undefined)?.message ?? 'Chargement impossible';

export const assembleeSlice = createSlice({
  name: 'assemblee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadScrutinDetailUsecase.pending, (state, action) => {
        state.details[action.meta.arg] = { status: 'loading' };
      })
      .addCase(loadScrutinDetailUsecase.fulfilled, (state, action) => {
        state.details[action.meta.arg] = { status: 'loaded', data: action.payload };
      })
      .addCase(loadScrutinDetailUsecase.rejected, (state, action) => {
        state.details[action.meta.arg] = { status: 'error', error: messageOf(action.payload) };
      })
      .addCase(loadDeputesUsecase.pending, (state) => {
        state.deputes = { status: 'loading' };
      })
      .addCase(loadDeputesUsecase.fulfilled, (state, action) => {
        state.deputes = { status: 'loaded', data: action.payload };
      })
      .addCase(loadDeputesUsecase.rejected, (state, action) => {
        state.deputes = { status: 'error', error: messageOf(action.payload) };
      });
  },
});
