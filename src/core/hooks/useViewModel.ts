import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  appDispatch,
  appSelector,
  type AppDispatch,
  type AppState,
} from '@/src/core/store/create-store';

export type Router = ReturnType<typeof useRouter>;

type ViewModelDeps = { dispatch: AppDispatch; router: Router; [key: string]: unknown };
type ViewModelFactory<T, D extends ViewModelDeps = ViewModelDeps> = (
  deps: D
) => (state: AppState) => T;

export function useViewModel<T, D extends ViewModelDeps>(factory: ViewModelFactory<T, D>): T {
  const dispatch = appDispatch();
  const router = useRouter();
  const [selector] = useState(() => factory({ dispatch, router } as unknown as D));
  return appSelector(selector);
}
