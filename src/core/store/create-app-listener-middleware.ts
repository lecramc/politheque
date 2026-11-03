import { createListenerMiddleware } from '@reduxjs/toolkit';

import { AppDispatch, AppState, Dependencies } from '@/src/core/store/create-store';

export const createAppListenerMiddleware = () =>
  createListenerMiddleware<AppState, AppDispatch, Dependencies>();
