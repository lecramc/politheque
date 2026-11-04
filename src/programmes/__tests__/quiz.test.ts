import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeProgrammeGateway } from '@/src/programmes/gateways/fake-programme.gateway';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';
import { selectAnswers } from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';
import { quizViewModel } from '@/src/programmes/view-models/quiz.view-model';
import { resultsViewModel } from '@/src/programmes/view-models/results.view-model';

const question = (id: string): Question => ({
  id,
  theme: 'economie',
  statement: id,
  help: '',
  axis: 'economique',
  direction: 1,
});

const setup = async () => {
  const gateway = new FakeProgrammeGateway();
  gateway.catalog = {
    ...gateway.catalog,
    questions: ['q1', 'q2', 'q3', 'q4', 'q5'].map(question),
    parties: [
      partyFactory({ id: 'a', name: 'A', stanceValues: { q1: 2, q2: 2, q3: 2, q4: 2, q5: 2 } }),
      partyFactory({
        id: 'b',
        name: 'B',
        stanceValues: { q1: -2, q2: -2, q3: -2, q4: -2, q5: -2 },
      }),
    ],
  };
  const store = createTestStore({ dependencies: { programmeGateway: gateway } });
  await store.dispatch(loadCatalogUsecase());
  const router = { push: vi.fn(), replace: vi.fn() } as never;
  return { store, router };
};

describe('Feature: questionnaire', () => {
  it('should load the catalog through the gateway', async () => {
    const { store } = await setup();
    expect(store.getState().programmes.status).toBe('loaded');
    expect(store.getState().programmes.catalog?.questions).toHaveLength(5);
  });

  it('should move to the next question after answering', async () => {
    const { store, router } = await setup();
    const vm = quizViewModel({ dispatch: store.dispatch, router });
    vm(store.getState()).choose(2);
    expect(vm(store.getState()).question?.id).toBe('q2');
  });

  it('should open the results after the last answer', async () => {
    const { store, router } = await setup();
    const vm = quizViewModel({ dispatch: store.dispatch, router });
    for (let i = 0; i < 5; i++) vm(store.getState()).choose(1);
    expect(store.getState().quiz.finished).toBe(true);
    expect((router as unknown as { push: ReturnType<typeof vi.fn> }).push).toHaveBeenCalledWith(
      '/me-situer/resultats'
    );
  });

  it('should keep the importance flag when the answer changes', async () => {
    const { store } = await setup();
    store.dispatch(quizActions.toggleImportant('q1'));
    store.dispatch(quizActions.answer({ questionId: 'q1', value: 1 }));
    expect(selectAnswers(store.getState()).q1).toEqual({ value: 1, important: true });
  });

  it('should not create an answer when only the importance is toggled', async () => {
    const { store, router } = await setup();
    store.dispatch(quizActions.toggleImportant('q1'));
    expect(selectAnswers(store.getState())).toEqual({});
    const vm = quizViewModel({ dispatch: store.dispatch, router })(store.getState());
    expect(vm.selectedValue).toBeUndefined();
    expect(vm.answeredCount).toBe(0);
  });

  it('should rank the closest party first in the results', async () => {
    const { store, router } = await setup();
    for (const id of ['q1', 'q2', 'q3', 'q4', 'q5']) {
      store.dispatch(quizActions.answer({ questionId: id, value: -1 }));
    }
    const results = resultsViewModel({ dispatch: store.dispatch, router })(store.getState());
    expect(results.ranking.map((r) => r.partyId)).toEqual(['b', 'a']);
    expect(results.enoughAnswers).toBe(false);
  });
});

describe('Feature: tampon « Me situer »', () => {
  const answerAll = (store: Awaited<ReturnType<typeof setup>>['store'], value: AnswerValue) => {
    for (const id of ['q1', 'q2', 'q3', 'q4', 'q5']) {
      store.dispatch(quizActions.answer({ questionId: id, value }));
    }
  };

  it('should mark quiz:done when results are shown after answering every question', async () => {
    const { store, router } = await setup();
    answerAll(store, 1);
    await quizViewModel({ dispatch: store.dispatch, router })(store.getState()).showResults();
    expect(store.getState().progress.entries['quiz:done']).toBeDefined();
  });

  it('should count "pas d\'avis" answers as given', async () => {
    const { store, router } = await setup();
    answerAll(store, null);
    await quizViewModel({ dispatch: store.dispatch, router })(store.getState()).showResults();
    expect(store.getState().progress.entries['quiz:done']).toBeDefined();
  });

  it('should not mark quiz:done when results are shown early', async () => {
    const { store, router } = await setup();
    store.dispatch(quizActions.answer({ questionId: 'q1', value: 1 }));
    await quizViewModel({ dispatch: store.dispatch, router })(store.getState()).showResults();
    expect(store.getState().progress.entries['quiz:done']).toBeUndefined();
  });

  it('should keep quiz:done after the quiz is restarted', async () => {
    const { store, router } = await setup();
    answerAll(store, 1);
    const vm = quizViewModel({ dispatch: store.dispatch, router })(store.getState());
    await vm.showResults();
    vm.restart();
    expect(store.getState().quiz.values).toEqual({});
    expect(store.getState().progress.entries['quiz:done']).toBeDefined();
  });
});
