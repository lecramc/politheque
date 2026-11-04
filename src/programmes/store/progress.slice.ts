import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { JourneyStepId } from '@/src/programmes/models/journey.model';
import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';
import {
  clearReadingProgressUsecase,
  loadReadingProgressUsecase,
  markContentReadUsecase,
} from '@/src/programmes/usecases/reading-progress.usecase';

export type ProgressState = {
  /** 'unknown' tant que le stockage n'a pas été lu (rendu statique, premier rendu natif). */
  status: 'unknown' | 'ready';
  entries: ReadingEntries;
  /** Tampons obtenus PENDANT cette session et pas encore montrés (animation jouée une fois). */
  celebrations: JourneyStepId[];
};

const initialState: ProgressState = { status: 'unknown', entries: {}, celebrations: [] };

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    /** Retire ces tampons de la file : leur animation a été jouée. */
    celebrationsShown(state, action: PayloadAction<JourneyStepId[]>) {
      state.celebrations = state.celebrations.filter((id) => !action.payload.includes(id));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReadingProgressUsecase.fulfilled, (state, action) => {
        state.status = 'ready';
        state.entries = action.payload;
      })
      .addCase(markContentReadUsecase.fulfilled, (state, action) => {
        state.entries = action.payload.entries;
        state.celebrations.push(...action.payload.newStamps);
      })
      .addCase(clearReadingProgressUsecase.fulfilled, (state) => {
        state.entries = {};
        state.celebrations = [];
      });
  },
});

export const progressActions = progressSlice.actions;
