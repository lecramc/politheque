import { useEffect } from 'react';

import { appDispatch } from '@/src/core/store/create-store';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';
import { loadReadingProgressUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

/** Effets globaux : chargement du catalogue (partis, thèmes, questionnaire, guide). */
export function GlobalEffects() {
  const dispatch = appDispatch();
  useEffect(() => {
    dispatch(loadCatalogUsecase());
    dispatch(loadReadingProgressUsecase());
  }, [dispatch]);
  return null;
}
