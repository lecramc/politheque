import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeReadingProgressGateway } from '@/src/programmes/gateways/fake-reading-progress.gateway';
import {
  loadReadingProgressUsecase,
  markSectionReadUsecase,
} from '@/src/programmes/usecases/reading-progress.usecase';

describe('Feature: progression de lecture du guide', () => {
  it('should restore the sections already read on this device', async () => {
    const gateway = new FakeReadingProgressGateway();
    gateway.saved = ['institutions'];
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(loadReadingProgressUsecase());
    expect(store.getState().reading.readIds).toEqual(['institutions']);
  });

  it('should save a newly read section once', async () => {
    const gateway = new FakeReadingProgressGateway();
    const store = createTestStore({ dependencies: { readingProgressGateway: gateway } });
    await store.dispatch(markSectionReadUsecase('budget-dette'));
    await store.dispatch(markSectionReadUsecase('budget-dette'));
    expect(gateway.saved).toEqual(['budget-dette']);
    expect(store.getState().reading.readIds).toEqual(['budget-dette']);
  });
});
