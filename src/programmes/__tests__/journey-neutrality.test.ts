import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeReadingProgressGateway } from '@/src/programmes/gateways/fake-reading-progress.gateway';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { computeJourneyProgress } from '@/src/programmes/models/journey.service';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import { selectJourney } from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { journeyStepViewModel } from '@/src/programmes/view-models/journey-step.view-model';
import { journeyViewModel } from '@/src/programmes/view-models/journey.view-model';
import { passportViewModel } from '@/src/programmes/view-models/passport.view-model';
import { quizViewModel } from '@/src/programmes/view-models/quiz.view-model';

const D1 = '2026-11-03T08:00:00.000Z';
const D2 = '2026-11-04T08:00:00.000Z';
const catalog = buildStaticCatalog();
const partyIds = catalog.parties.map((p) => p.id);
const NOW = new Date('2026-11-04T10:00:00.000Z');

const base = () => stateBuilder().withCatalog(catalog).withProgressStatus('ready');
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const partiesStep = (entries: Record<string, string> = {}) =>
  journeyStepViewModel('les-partis')()(base().withEntries(entries).build());

describe('Feature: neutralité du parcours', () => {
  it('should list the parties of the step in the gateway order (alphabetical, fr)', () => {
    const sorted = [...catalog.parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    expect(partiesStep().items.map((i) => i.key)).toEqual(sorted.map((p) => `party:${p.id}`));
  });

  it('should keep the catalog order of parties even when read dates differ', () => {
    const entries = { [`party:${partyIds[0]}`]: D2, [`party:${partyIds[1]}`]: D1 };
    expect(partiesStep(entries).items.map((i) => i.key)).toEqual(
      partyIds.map((id) => `party:${id}`)
    );
  });

  it('should suggest as next party the first unread one in alphabetical order', () => {
    const entries = { [`party:${partyIds[0]}`]: D1, [`party:${partyIds[2]}`]: D1 };
    expect(partiesStep(entries).nextItem?.href).toBe(`/partis/${partyIds[1]}`);
  });

  it('should give every party item the same stamp model, whatever the party', () => {
    const items = partiesStep({ [`party:${partyIds[0]}`]: D1 }).items;
    for (const item of items)
      expect(Object.keys(item).sort()).toEqual(Object.keys(items[0]).sort());
    const empties = items.filter((i) => !i.read);
    for (const item of empties) expect(item.stamp).toEqual(empties[0].stamp);
    const read = partiesStep(Object.fromEntries(partyIds.map((id) => [`party:${id}`, D1]))).items;
    for (const item of read) expect(item.stamp).toEqual(read[0].stamp);
  });

  it('should not expose any color in stamp models of the step and passport view-models', () => {
    const entries = Object.fromEntries(partyIds.map((id) => [`party:${id}`, D1]));
    const state = base()
      .withEntries({ ...entries, 'stamp:les-partis': D1 })
      .build();
    const store = createTestStore({ initialState: state });
    const passport = passportViewModel()({ dispatch: store.dispatch })(state);
    const stampModels = [
      ...partiesStep(entries).items.map((i) => i.stamp),
      ...passport.stamps,
      ...passport.parties.items,
      ...passport.debates.items,
    ];
    for (const model of stampModels) {
      expect(Object.keys(model).join(',')).not.toMatch(/color/i);
    }
    expect(passport.parties.items.every((item) => item.state === 'stamped')).toBe(true);
  });

  it('should complete the parties step only when every party has been read', () => {
    const journey = selectJourney(base().build());
    const almost = Object.fromEntries(partyIds.slice(1).map((id) => [`party:${id}`, D1]));
    const status = (entries: Record<string, string>) =>
      computeJourneyProgress(journey, entries).steps.find((s) => s.step.id === 'les-partis')!
        .status;
    expect(status(almost)).toBe('in-progress');
    expect(status({ ...almost, [`party:${partyIds[0]}`]: D1 })).toBe('done');
  });

  const completeQuiz = (value: AnswerValue) => {
    const gateway = new FakeReadingProgressGateway();
    const state = base()
      .withEntries({ 'guide:institutions': D1, [`party:${partyIds[0]}`]: D1 })
      .build();
    const store = createTestStore({
      initialState: state,
      dependencies: { readingProgressGateway: gateway },
    });
    for (const q of catalog.questions) {
      store.dispatch(quizActions.answer({ questionId: q.id, value }));
      if (value !== null) store.dispatch(quizActions.toggleImportant(q.id));
    }
    return { store, gateway };
  };

  const finish = async (store: ReturnType<typeof completeQuiz>['store']) => {
    const router = { push: () => undefined, replace: () => undefined } as never;
    await quizViewModel({ dispatch: store.dispatch, router })(store.getState()).showResults();
  };

  // Trois questionnaires complets : plus lent que le délai par défaut quand la suite tourne en parallèle.
  it(
    'should produce the same journey and passport whatever the quiz answers',
    { timeout: 30_000 },
    async () => {
      const results = [];
      for (const value of [2, -2, null] as AnswerValue[]) {
        const { store } = completeQuiz(value);
        await finish(store);
        const state = store.getState();
        results.push({
          journey: plain(journeyViewModel(NOW)({ dispatch: store.dispatch })(state)),
          step: plain(journeyStepViewModel('les-partis')()(state)),
          passport: plain(passportViewModel()({ dispatch: store.dispatch })(state)),
          entryKeys: Object.keys(state.progress.entries).sort(),
        });
      }
      expect(results[1]).toEqual(results[0]);
      expect(results[2]).toEqual(results[0]);
    }
  );

  it('should never persist quiz answers, only the quiz:done key and a date', async () => {
    const { store, gateway } = completeQuiz(2);
    await finish(store);
    expect(gateway.entries['quiz:done']).toBeDefined();
    const stored = JSON.stringify(gateway.entries);
    for (const q of catalog.questions) expect(stored).not.toContain(q.id);
    for (const [key, value] of Object.entries(gateway.entries)) {
      expect(key).toMatch(/^(guide|party|debate|election|quiz|stamp):[a-z0-9-]+$/);
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it('should never reference quiz answers in the next step or next item suggestion', async () => {
    const suggestions = [];
    for (const value of [2, -2] as AnswerValue[]) {
      const { store } = completeQuiz(value);
      await finish(store);
      const home = journeyViewModel(NOW)({ dispatch: store.dispatch })(store.getState());
      suggestions.push({
        next: home.summary?.next,
        nextItem: partiesStep(store.getState().progress.entries).nextItem,
      });
    }
    expect(suggestions[0]).toEqual(suggestions[1]);
  });
});
