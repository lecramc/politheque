import { AppState, createStore, Dependencies } from '@/src/core/store/create-store';
import { FakeProgrammeGateway } from '@/src/programmes/gateways/fake-programme.gateway';
import { FakeReadingProgressGateway } from '@/src/programmes/gateways/fake-reading-progress.gateway';

const createDependencies = (dependencies?: Partial<Dependencies>): Dependencies => ({
  programmeGateway: new FakeProgrammeGateway(),
  readingProgressGateway: new FakeReadingProgressGateway(),
  ...dependencies,
});

export const createTestStore = (config?: {
  initialState?: Partial<AppState>;
  dependencies?: Partial<Dependencies>;
}) => {
  return createStore({
    initialState: config?.initialState as AppState,
    dependencies: createDependencies(config?.dependencies),
  });
};
