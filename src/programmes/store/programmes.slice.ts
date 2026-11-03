import { createSlice } from '@reduxjs/toolkit';

import type { Catalog } from '@/src/programmes/models/programme.model';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';

export type ProgrammesState = {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  catalog: Catalog | null;
};

const initialState: ProgrammesState = { status: 'idle', catalog: null };

export const programmesSlice = createSlice({
  name: 'programmes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalogUsecase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCatalogUsecase.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.catalog = action.payload;
      })
      .addCase(loadCatalogUsecase.rejected, (state) => {
        state.status = 'error';
      });
  },
});
