import { FakeAssembleeGateway } from '@/src/assemblee/gateways/fake-assemblee.gateway';
import { detailFactory } from '@/src/assemblee/models/scrutin.factory';
import { selectScrutinDetail } from '@/src/assemblee/store/assemblee.selector';
import { loadScrutinDetailUsecase } from '@/src/assemblee/usecases/load-scrutin-detail.usecase';
import { createTestStore } from '@/src/core/store/create-test-store';

const detail = detailFactory({ numero: 580, places: [1], votes: 'P', deputes: [0], groupes: [0] });

const setup = () => {
  const gateway = new FakeAssembleeGateway();
  gateway.details[580] = detail;
  const store = createTestStore({ dependencies: { assembleeGateway: gateway } });
  return { gateway, store };
};

describe('Feature: chargement du détail nominatif d’un scrutin', () => {
  it('should know nothing about a scrutin before loading', () => {
    const { store } = setup();
    expect(selectScrutinDetail(580)(store.getState())).toEqual({ status: 'idle' });
  });

  it('should be loading while the file is fetched', () => {
    const { store } = setup();
    void store.dispatch(loadScrutinDetailUsecase(580));
    expect(selectScrutinDetail(580)(store.getState())).toEqual({ status: 'loading' });
  });

  it('should hold the nominative detail once loaded', async () => {
    const { store } = setup();
    await store.dispatch(loadScrutinDetailUsecase(580));
    expect(selectScrutinDetail(580)(store.getState())).toEqual({
      status: 'loaded',
      data: detail,
    });
  });

  it('should show an error state when the detail fails to load, without touching other scrutins', async () => {
    const { gateway, store } = setup();
    gateway.details[581] = detailFactory({ numero: 581 });
    gateway.failingScrutins.add(580);
    await store.dispatch(loadScrutinDetailUsecase(580));
    await store.dispatch(loadScrutinDetailUsecase(581));
    expect(selectScrutinDetail(580)(store.getState())).toEqual({
      status: 'error',
      error: 'Détail du scrutin 580 indisponible',
    });
    expect(selectScrutinDetail(581)(store.getState()).status).toBe('loaded');
  });

  it('should load a given scrutin once, whether loading or loaded', async () => {
    const { gateway, store } = setup();
    const first = store.dispatch(loadScrutinDetailUsecase(580));
    await store.dispatch(loadScrutinDetailUsecase(580));
    await first;
    await store.dispatch(loadScrutinDetailUsecase(580));
    expect(gateway.detailCalls).toEqual([580]);
  });

  it('should allow a new attempt after an error', async () => {
    const { gateway, store } = setup();
    gateway.failingScrutins.add(580);
    await store.dispatch(loadScrutinDetailUsecase(580));
    gateway.failingScrutins.clear();
    await store.dispatch(loadScrutinDetailUsecase(580));
    expect(selectScrutinDetail(580)(store.getState()).status).toBe('loaded');
    expect(gateway.detailCalls).toEqual([580, 580]);
  });
});
