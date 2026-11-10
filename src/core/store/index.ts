import { Platform } from 'react-native';

import {
  buildStaticIndex,
  buildStaticManifest,
  StaticAssembleeGateway,
} from '@/src/assemblee/gateways/static-assemblee.gateway';
import { SITE_URL } from '@/src/core/config/app';
import { AsyncStorageReadingProgressGateway } from '@/src/programmes/gateways/async-storage-reading-progress.gateway';
import {
  buildStaticCatalog,
  StaticProgrammeGateway,
} from '@/src/programmes/gateways/static-programme.gateway';
import { systemClock } from '@/src/programmes/gateways/system-clock.gateway';

import { AppState, createStore } from './create-store';

// Catalogue préchargé : l'export statique contient déjà le texte des pages (référencement,
// affichage sans attendre le JavaScript). Même principe pour l'index des scrutins de l'Assemblée :
// titre, résultat et décompte par groupe sont pré-rendus ; le détail nominatif (un fichier par
// scrutin) et l'annuaire des députés se chargent à la demande, depuis la même origine sur le web.
export const store = createStore({
  initialState: {
    programmes: { status: 'loaded', catalog: buildStaticCatalog() },
    assemblee: {
      index: buildStaticIndex(),
      manifest: buildStaticManifest(),
      details: {},
      deputes: { status: 'idle' },
    },
  } as unknown as AppState,
  dependencies: {
    programmeGateway: new StaticProgrammeGateway(),
    assembleeGateway: new StaticAssembleeGateway({
      baseUrl: Platform.OS === 'web' ? '' : SITE_URL,
    }),
    readingProgressGateway: new AsyncStorageReadingProgressGateway(),
    clock: systemClock,
  },
});
