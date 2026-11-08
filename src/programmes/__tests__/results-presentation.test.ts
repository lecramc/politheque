import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeProgrammeGateway } from '@/src/programmes/gateways/fake-programme.gateway';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';
import { quizActions } from '@/src/programmes/store/quiz.slice';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { loadCatalogUsecase } from '@/src/programmes/usecases/load-catalog.usecase';
import { resultsViewModel } from '@/src/programmes/view-models/results.view-model';

const IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
const question = (id: string): Question => ({
  id,
  theme: 'economie',
  statement: `Affirmation ${id}`,
  shortLabel: id,
  help: '',
  axis: null,
  direction: 1,
});
const stances = (value: number, overrides: Record<string, number | null> = {}) =>
  Object.fromEntries(
    IDS.map((id) => [id, overrides[id] === undefined ? value : overrides[id]])
  ) as Record<string, never>;

// Questionnaire de 30 questions dont les 10 premières sont répondues : la marge s'élargit à ± 9.
const UNANSWERED_IDS = Array.from({ length: 20 }, (_, index) => `u${index}`);

const results = async (parties: ReturnType<typeof partyFactory>[], userValue = 2) => {
  const gateway = new FakeProgrammeGateway();
  gateway.catalog = {
    ...gateway.catalog,
    questions: [...IDS, ...UNANSWERED_IDS].map(question),
    parties,
  };
  const store = createTestStore({ dependencies: { programmeGateway: gateway } });
  await store.dispatch(loadCatalogUsecase());
  for (const id of IDS) {
    store.dispatch(quizActions.answer({ questionId: id, value: userValue as never }));
  }
  const router = { push: () => undefined, replace: () => undefined } as never;
  return resultsViewModel({ dispatch: store.dispatch, router })(store.getState());
};

describe('Feature: présentation des résultats', () => {
  it('should show tied parties with the same rank instead of ordering them by name', async () => {
    const vm = await results([
      partyFactory({ id: 'z', name: 'Zed', stanceValues: stances(2) }),
      partyFactory({ id: 'a', name: 'Abel', stanceValues: stances(2) }),
    ]);
    expect(vm.ranking.map((r) => [r.rank, r.tied])).toEqual([
      [1, true],
      [1, true],
    ]);
    expect(vm.leadGroup.names.sort()).toEqual(['Abel', 'Zed']);
    expect(vm.leadGroup.sentence).toContain("sans qu'on puisse les départager");
  });

  it('should describe a single leader when the others are beyond the margin', async () => {
    const vm = await results([
      partyFactory({ id: 'a', name: 'Abel', stanceValues: stances(2) }),
      partyFactory({ id: 'b', name: 'Bravo', stanceValues: stances(-2) }),
    ]);
    expect(vm.leadGroup.names).toEqual(['Abel']);
    expect(vm.leadGroup.sentence).toContain('se détache');
    expect(vm.separating).toEqual([]);
  });

  it('should expose the margin and the separating questions of the leading group', async () => {
    const vm = await results([
      partyFactory({ id: 'a', name: 'Abel', stanceValues: stances(2, { q1: 0 }) }),
      partyFactory({ id: 'b', name: 'Bravo', stanceValues: stances(2, { q1: 2 }) }),
    ]);
    expect(vm.margin).toBe(9);
    expect(vm.marginSentence).toContain('± 9 points');
    expect(vm.separating).toHaveLength(1);
    expect(vm.separating[0]).toMatchObject({
      statement: 'Affirmation q1',
      userLabel: "Tout à fait d'accord",
    });
    expect(vm.separating[0].positions.map((p) => p.name)).toEqual(['Abel', 'Bravo']);
  });

  it('should not separate nor list a leading group of four parties or more', async () => {
    const vm = await results(
      ['a', 'b', 'c', 'd'].map((id, index) =>
        partyFactory({
          id,
          name: `Parti ${id}`,
          stanceValues: stances(2, { q1: index % 2 === 0 ? 0 : 2 }),
        })
      )
    );
    expect(vm.leadGroup.broad).toBe(true);
    expect(vm.leadGroup.sentence).toContain('proches de 4 partis de sensibilités différentes');
    expect(vm.leadGroup.sentence).not.toContain('Parti a');
    expect(vm.separating).toEqual([]);
    expect(vm.leadGroup.pointer).toContain('« Ma carte »');
  });

  it('should keep the compact separation for a leading group of two or three parties', async () => {
    const vm = await results(
      ['a', 'b', 'c'].map((id, index) =>
        partyFactory({ id, name: `Parti ${id}`, stanceValues: stances(2, { q1: index }) })
      )
    );
    expect(vm.leadGroup.broad).toBe(false);
    expect(vm.leadGroup.pointer).toBeNull();
    expect(vm.separating[0].positions).toHaveLength(3);
  });

  it('should flag a party compared on less than 80 % of the answers, with a warning', async () => {
    const vm = await results([
      partyFactory({
        id: 'a',
        name: 'Abel',
        stanceValues: stances(2, { q1: null, q2: null, q3: null }),
      }),
      partyFactory({ id: 'b', name: 'Bravo', stanceValues: stances(2) }),
    ]);
    const abel = vm.ranking.find((r) => r.party.id === 'a')!;
    const bravo = vm.ranking.find((r) => r.party.id === 'b')!;
    expect(abel.fewCompared).toBe(true);
    expect(abel.fewComparedNote).toContain('Position inconnue sur 3 de vos réponses');
    expect(bravo.fewCompared).toBe(false);
    expect(bravo.fewComparedNote).toBeNull();
  });

  it('should tell the answers are lost when the stamp exists but no answer is in memory', () => {
    const gateway = new FakeProgrammeGateway();
    const store = createTestStore({
      initialState: stateBuilder()
        .withCatalog({ ...gateway.catalog, questions: IDS.map(question), parties: [] })
        .withEntries({ 'quiz:done': '2026-11-03T08:00:00.000Z' })
        .build(),
    });
    const router = { push: () => undefined, replace: () => undefined } as never;
    const vm = resultsViewModel({ dispatch: store.dispatch, router })(store.getState());
    expect(vm.resultsLost).toBe(true);
    expect(vm.resultsLostMessage).toContain('Vos réponses ne sont pas conservées');
  });

  it('should not claim the answers are lost while they are in memory', async () => {
    const vm = await results([partyFactory({ id: 'a', name: 'Abel', stanceValues: stances(2) })]);
    expect(vm.resultsLost).toBe(false);
  });
});
