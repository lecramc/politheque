import { useEffect } from 'react';

import { appDispatch } from '@/src/core/store/create-store';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';
import { loadReadingProgressUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

/**
 * Effets globaux : chargement du catalogue (partis, thèmes, questionnaire, guide), puis de la
 * progression de lecture (elle a besoin du catalogue pour attribuer les tampons déjà gagnés).
 */
export function GlobalEffects() {
  const dispatch = appDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(loadCatalogUsecase());
      await dispatch(loadReadingProgressUsecase());
    })();
  }, [dispatch]);
  return null;
}
