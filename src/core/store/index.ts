import { AsyncStorageReadingProgressGateway } from '@/src/programmes/gateways/async-storage-reading-progress.gateway';
import { StaticProgrammeGateway } from '@/src/programmes/gateways/static-programme.gateway';

import { createStore } from './create-store';

export const store = createStore({
  dependencies: {
    programmeGateway: new StaticProgrammeGateway(),
    readingProgressGateway: new AsyncStorageReadingProgressGateway(),
  },
});
