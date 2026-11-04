import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeClock } from '@/src/programmes/gateways/fake-clock.gateway';
import { FakeReadingProgressGateway } from '@/src/programmes/gateways/fake-reading-progress.gateway';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { progressActions } from '@/src/programmes/store/progress.slice';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import {
  clearReadingProgressUsecase,
  loadReadingProgressUsecase,
  markContentReadUsecase,
} from '@/src/programmes/usecases/reading-progress.usecase';

const D = '2026-11-03T08:00:00.000Z';
const NOW = '2026-11-04T10:00:00.000Z';

describe('Feature: chargement de la progression', () => {
  it('should be unknown before loading', () => {
    const store = createTestStore();
    expect(store.getState().progress).toEqual({ status: 'unknown', entries: {}, celebrations: [] });
  });

  it('should restore the registry stored on this device and become ready', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.entries = { 'guide:institutions': D };
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(loadReadingProgressUsecase());
    expect(store.getState().progress.status).toBe('ready');
    expect(store.getState().progress.entries).toEqual({ 'guide:institutions': D });
  });

  it('should keep a content marked read before loading finished', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.entries = { 'guide:institutions': D };
    const store = createTestStore({
      initialState: stateBuilder().withEntries({ 'party:alpha': NOW }).build(),
      dependencies: { readingProgressGateway: gateway },
    });
    await store.dispatch(loadReadingProgressUsecase());
    expect(store.getState().progress.entries).toEqual({
      'guide:institutions': D,
      'party:alpha': NOW,
    });
  });

  it('should silently award stamps for steps already complete at load, without celebration', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.entries = {
      'party:zeta': D,
      'party:alpha': D,
      'party:milieu': D,
    };
    const store = createTestStore({
      initialState: stateBuilder().withCatalog(catalogFactory()).build(),
      dependencies: { readingProgressGateway: gateway },
    });
    await store.dispatch(loadReadingProgressUsecase());
    expect(store.getState().progress.entries['stamp:les-partis']).toBe(NOW);
    expect(store.getState().progress.celebrations).toEqual([]);
    expect(gateway.entries['stamp:les-partis']).toBe(NOW);
  });
});

describe('Feature: marquer un contenu comme lu', () => {
  it('should store the key with the ISO date of the clock', async () => {
    const gateway = new FakeReadingProgressGateway();
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    expect(store.getState().progress.entries).toEqual({ 'guide:budget-dette': NOW });
    expect(gateway.entries).toEqual({ 'guide:budget-dette': NOW });
  });

  it('should keep the first reading date when the same content is read again', async () => {
    const clock = new FakeClock();
    const store = createTestStore({ dependencies: { clock } });
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    clock.current = new Date('2026-12-01T00:00:00.000Z');
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    expect(store.getState().progress.entries['guide:budget-dette']).toBe(NOW);
  });

  it('should not write to storage when the content is already read', async () => {
    const gateway = new FakeReadingProgressGateway();
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    expect(gateway.saveCount).toBe(1);
  });

  it('should not overwrite progress stored by another tab before saving', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.entries = { 'party:alpha': D };
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    expect(gateway.entries).toEqual({ 'party:alpha': D, 'guide:budget-dette': NOW });
    expect(store.getState().progress.entries).toEqual(gateway.entries);
  });

  it('should keep working in memory when storage fails', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.save = async () => undefined; // échec silencieux, comme le vrai gateway
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(markContentReadUsecase('guide:budget-dette'));
    expect(store.getState().progress.entries).toEqual({ 'guide:budget-dette': NOW });
  });
});

describe('Feature: tampons du parcours', () => {
  const almostDone = () =>
    stateBuilder()
      .withCatalog(catalogFactory())
      .withEntries({ 'party:zeta': D, 'party:alpha': D })
      .build();

  it('should award the step stamp when its last content is read', async () => {
    const gateway = new FakeReadingProgressGateway();
    const store = createTestStore({
      initialState: almostDone(),
      dependencies: { readingProgressGateway: gateway },
    });
    await store.dispatch(markContentReadUsecase('party:milieu'));
    expect(store.getState().progress.entries['stamp:les-partis']).toBe(NOW);
    expect(gateway.entries['stamp:les-partis']).toBe(NOW);
  });

  it('should not award a stamp while the step is incomplete', async () => {
    const store = createTestStore({ initialState: almostDone() });
    await store.dispatch(markContentReadUsecase('debate:economie'));
    expect(Object.keys(store.getState().progress.entries).some((k) => k.startsWith('stamp:'))).toBe(
      false
    );
  });

  it('should queue the new stamp for celebration once', async () => {
    const store = createTestStore({ initialState: almostDone() });
    await store.dispatch(markContentReadUsecase('party:milieu'));
    expect(store.getState().progress.celebrations).toEqual(['les-partis']);
  });

  it('should remove a celebration once it has been shown', async () => {
    const store = createTestStore({ initialState: almostDone() });
    await store.dispatch(markContentReadUsecase('party:milieu'));
    store.dispatch(progressActions.celebrationsShown(['les-partis']));
    expect(store.getState().progress.celebrations).toEqual([]);
  });

  it('should not celebrate again a stamp already acquired', async () => {
    const store = createTestStore({
      initialState: stateBuilder()
        .withCatalog(catalogFactory())
        .withEntries({ 'party:zeta': D, 'party:alpha': D, 'stamp:les-partis': D })
        .build(),
    });
    await store.dispatch(markContentReadUsecase('party:milieu'));
    expect(store.getState().progress.celebrations).toEqual([]);
  });
});

describe('Feature: effacer ma progression', () => {
  const populated = () =>
    stateBuilder()
      .withProgressStatus('ready')
      .withEntries({ 'party:alpha': D, 'stamp:les-partis': D })
      .withCelebrations(['les-partis'])
      .withQuizValues({ q1: 2, q2: null })
      .build();

  it('should clear storage, registry and pending celebrations', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.entries = { 'party:alpha': D };
    const store = createTestStore({
      initialState: populated(),
      dependencies: { readingProgressGateway: gateway },
    });
    await store.dispatch(clearReadingProgressUsecase());
    expect(gateway.cleared).toBe(true);
    expect(store.getState().progress).toEqual({ status: 'ready', entries: {}, celebrations: [] });
  });

  it('should leave the quiz answers in memory untouched', async () => {
    const store = createTestStore({ initialState: populated() });
    await store.dispatch(clearReadingProgressUsecase());
    expect(store.getState().quiz.values).toEqual({ q1: 2, q2: null });
  });
});
