import { createAsyncThunk } from '@reduxjs/toolkit';

import { AppDispatch, AppState, Dependencies } from './create-store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppState;
  dispatch: AppDispatch;
  extra: Dependencies;
  rejectValue: unknown;
}>();
