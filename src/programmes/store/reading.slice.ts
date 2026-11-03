import { createSlice } from '@reduxjs/toolkit';

import {
  loadReadingProgressUsecase,
  markSectionReadUsecase,
} from '@/src/programmes/usecases/reading-progress.usecase';

export type ReadingState = { readIds: string[] };

const initialState: ReadingState = { readIds: [] };

export const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadReadingProgressUsecase.fulfilled, (state, action) => {
        state.readIds = action.payload;
      })
      .addCase(markSectionReadUsecase.fulfilled, (state, action) => {
        state.readIds = action.payload;
      });
  },
});
