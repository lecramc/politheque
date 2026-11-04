import { AsyncStorageReadingProgressGateway } from '@/src/programmes/gateways/async-storage-reading-progress.gateway';
import {
  buildStaticCatalog,
  StaticProgrammeGateway,
} from '@/src/programmes/gateways/static-programme.gateway';
import { systemClock } from '@/src/programmes/gateways/system-clock.gateway';

import { AppState, createStore } from './create-store';

// Catalogue préchargé : l'export statique contient déjà le texte des pages (référencement,
// affichage sans attendre le JavaScript).
export const store = createStore({
  initialState: {
    programmes: { status: 'loaded', catalog: buildStaticCatalog() },
  } as unknown as AppState,
  dependencies: {
    programmeGateway: new StaticProgrammeGateway(),
    readingProgressGateway: new AsyncStorageReadingProgressGateway(),
    clock: systemClock,
  },
});
