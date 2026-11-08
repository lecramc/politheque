import { SITE_URL } from '@/src/core/config/app';
import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeProgrammeGateway } from '@/src/programmes/gateways/fake-programme.gateway';
import { decodeAnswers, readCodeFromHash } from '@/src/programmes/models/answer-link.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';
import { selectAnswers } from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';
import { resultsViewModel } from '@/src/programmes/view-models/results.view-model';

const IDS = [
  'q01-isf',
  'q02-depenses',
  'q25-successions',
  'q26-nationalisations',
  'q28-prix-energie',
];
const question = (id: string): Question => ({
  id,
  theme: 'economie',
  statement: `Affirmation ${id}`,
  shortLabel: '',
  help: '',
  axis: 'economique',
  direction: 1,
});

const setup = async () => {
  const gateway = new FakeProgrammeGateway();
  gateway.catalog = {
    ...gateway.catalog,
    questions: IDS.map(question),
    parties: [
      partyFactory({
        id: 'z',
        name: 'Zeta',
        stanceValues: Object.fromEntries(IDS.map((id) => [id, 2])),
      }),
      partyFactory({
        id: 'a',
        name: 'Alpha',
        stanceValues: Object.fromEntries(IDS.map((id) => [id, -2])),
      }),
    ],
  };
  const store = createTestStore({ dependencies: { programmeGateway: gateway } });
  await store.dispatch(loadCatalogUsecase());
  const router = { push: vi.fn(), replace: vi.fn() } as never;
  const vm = () => resultsViewModel({ dispatch: store.dispatch, router })(store.getState());
  return { store, vm };
};

describe('Feature: résultats ouverts depuis un lien personnel', () => {
  it('should load the decoded answers in memory without marking the quiz as done', async () => {
    const { store } = await setup();
    store.dispatch(quizActions.loadAnswers({ 'q01-isf': { value: 1, important: true } }));
    expect(selectAnswers(store.getState())).toEqual({ 'q01-isf': { value: 1, important: true } });
    expect(store.getState().progress.entries['quiz:done']).toBeUndefined();
    expect(store.getState().quiz.finished).toBe(false);
  });

  it('should expose a personal link that decodes back to the same answers', async () => {
    const { store, vm } = await setup();
    store.dispatch(quizActions.answer({ questionId: 'q01-isf', value: -2 }));
    store.dispatch(quizActions.toggleImportant('q01-isf'));
    store.dispatch(quizActions.answer({ questionId: 'q02-depenses', value: null }));
    const link = new URL(vm().personalLink);
    expect(link.origin).toBe(SITE_URL);
    expect(link.pathname).toBe('/me-situer/resultats');
    expect(link.search).toBe('');
    const decoded = decodeAnswers(readCodeFromHash(link.hash)!);
    expect(decoded).toMatchObject({ ok: true });
    expect(decoded.ok && decoded.answers['q01-isf']).toEqual({ value: -2, important: true });
    expect(decoded.ok && decoded.answers['q02-depenses']).toEqual({
      value: null,
      important: false,
    });
  });

  it('should expose a mailto: with the recap, without recipient and under 1800 characters', async () => {
    const { store, vm } = await setup();
    IDS.forEach((id) => store.dispatch(quizActions.answer({ questionId: id, value: 2 })));
    const { mailto } = vm();
    expect(mailto.startsWith('mailto:?subject=')).toBe(true);
    expect(mailto.length).toBeLessThan(1800);
    const body = decodeURIComponent(mailto);
    expect(body.indexOf('Zeta : 100 %')).toBeLessThan(body.indexOf('Alpha : 0 %'));
  });

  it('should give the printable recap one entry per question with the user answer', async () => {
    const { store, vm } = await setup();
    store.dispatch(quizActions.answer({ questionId: 'q01-isf', value: 1 }));
    store.dispatch(quizActions.toggleImportant('q01-isf'));
    store.dispatch(quizActions.answer({ questionId: 'q02-depenses', value: null }));
    const { printQuestions } = vm();
    expect(printQuestions.map((q) => q.question.id)).toEqual(IDS);
    expect(printQuestions[0]).toMatchObject({ answerLabel: "Plutôt d'accord", important: true });
    expect(printQuestions[1]).toMatchObject({ answerLabel: "Pas d'avis", important: false });
    expect(printQuestions[2]).toMatchObject({ answerLabel: 'Pas de réponse' });
  });

  it('should list the party positions of each printed question in alphabetical order', async () => {
    const { vm } = await setup();
    const names = vm().printQuestions[0].positions.map((p) => p.party.name);
    expect(names).toEqual(['Alpha', 'Zeta']);
  });
});
