import { FakeAssembleeGateway } from '@/src/assemblee/gateways/fake-assemblee.gateway';
import {
  deputeFactory,
  directoryFactory,
  detailFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { selectDeputes } from '@/src/assemblee/store/assemblee.selector';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { loadDeputesUsecase } from '@/src/assemblee/usecases/load-deputes.usecase';
import { loadScrutinDetailUsecase } from '@/src/assemblee/usecases/load-scrutin-detail.usecase';
import { createTestStore } from '@/src/core/store/create-test-store';

const directory = directoryFactory([deputeFactory({ id: 'PA1' }), deputeFactory({ id: 'PA2' })]);

const setup = () => {
  const gateway = new FakeAssembleeGateway();
  gateway.directory = directory;
  const store = createTestStore({ dependencies: { assembleeGateway: gateway } });
  return { gateway, store };
};

describe('Feature: chargement de l’annuaire des députés', () => {
  it('should be idle before loading', () => {
    const { store } = setup();
    expect(selectDeputes(store.getState())).toEqual({ status: 'idle' });
  });

  it('should be loading while the directory is fetched', () => {
    const { store } = setup();
    void store.dispatch(loadDeputesUsecase());
    expect(selectDeputes(store.getState())).toEqual({ status: 'loading' });
  });

  it('should hold the directory once loaded', async () => {
    const { store } = setup();
    await store.dispatch(loadDeputesUsecase());
    expect(selectDeputes(store.getState())).toEqual({ status: 'loaded', data: directory });
  });

  it('should load the directory once, however many scrutin pages ask for it', async () => {
    const { gateway, store } = setup();
    const first = store.dispatch(loadDeputesUsecase());
    await store.dispatch(loadDeputesUsecase());
    await first;
    await store.dispatch(loadDeputesUsecase());
    expect(gateway.deputesCalls).toBe(1);
  });

  it('should report an error, then accept a new attempt', async () => {
    const { gateway, store } = setup();
    gateway.error = new Error('annuaire indisponible');
    await store.dispatch(loadDeputesUsecase());
    expect(selectDeputes(store.getState())).toEqual({
      status: 'error',
      error: 'annuaire indisponible',
    });
    gateway.error = null;
    await store.dispatch(loadDeputesUsecase());
    expect(selectDeputes(store.getState()).status).toBe('loaded');
  });
});

describe('Feature: état initial des tests de l’Assemblée', () => {
  it('should not load again what the initial state already holds', async () => {
    const gateway = new FakeAssembleeGateway();
    const initialState = assembleeStateBuilder()
      .withDeputes(directory)
      .withDetail(detailFactory({ numero: 7 }))
      .build();
    const store = createTestStore({ initialState, dependencies: { assembleeGateway: gateway } });
    await store.dispatch(loadDeputesUsecase());
    await store.dispatch(loadScrutinDetailUsecase(7));
    expect(gateway.deputesCalls).toBe(0);
    expect(gateway.detailCalls).toEqual([]);
  });
});
