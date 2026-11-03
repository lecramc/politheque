import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { AnswerValue } from '@/src/programmes/models/matching.service';

/**
 * Réponses et importance sont stockées séparément : marquer une question « compte double »
 * avant d'y répondre ne doit pas créer une réponse « pas d'avis ».
 */
export type QuizState = {
  currentIndex: number;
  values: Record<string, AnswerValue>;
  important: Record<string, boolean>;
  finished: boolean;
};

const initialState: QuizState = { currentIndex: 0, values: {}, important: {}, finished: false };

export const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    answer(state, action: PayloadAction<{ questionId: string; value: AnswerValue }>) {
      state.values[action.payload.questionId] = action.payload.value;
    },
    toggleImportant(state, action: PayloadAction<string>) {
      state.important[action.payload] = !state.important[action.payload];
    },
    goTo(state, action: PayloadAction<number>) {
      state.currentIndex = Math.max(0, action.payload);
    },
    finish(state) {
      state.finished = true;
    },
    restart() {
      return initialState;
    },
  },
});

export const quizActions = quizSlice.actions;
