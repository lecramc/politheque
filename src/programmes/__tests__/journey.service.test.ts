import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { buildJourney, type JourneyStepId } from '@/src/programmes/models/journey.model';
import {
  computeJourneyProgress,
  isQuizComplete,
  stampsToAward,
} from '@/src/programmes/models/journey.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';

const D = '2026-11-04T10:00:00.000Z';
const journey = buildJourney(catalogFactory());
const itemKeys = (id: JourneyStepId) => journey.find((s) => s.id === id)!.items.map((i) => i.key);
const readAll = (...ids: JourneyStepId[]): ReadingEntries =>
  Object.fromEntries(ids.flatMap(itemKeys).map((k) => [k, D]));
const stamps = (...ids: JourneyStepId[]): ReadingEntries =>
  Object.fromEntries(ids.map((id) => [`stamp:${id}`, D]));
const stepOf = (id: JourneyStepId, entries: ReadingEntries, j = journey) =>
  computeJourneyProgress(j, entries).steps.find((s) => s.step.id === id)!;

describe('Feature: progression du parcours', () => {
  it('should report zero progress and advise step 1 for a new visitor', () => {
    const progress = computeJourneyProgress(journey, {});
    expect(progress.hasStarted).toBe(false);
    expect(progress.stampedCount).toBe(0);
    expect(progress.total).toBe(6);
    expect(progress.finished).toBe(false);
    expect(progress.next?.step.id).toBe('les-bases');
    expect(progress.steps.every((s) => s.ratio === 0 && s.status === 'todo')).toBe(true);
  });

  it('should advise the first step that is not done, in order', () => {
    const progress = computeJourneyProgress(journey, readAll('les-bases'));
    expect(progress.next?.step.id).toBe('les-institutions');
    expect(progress.hasStarted).toBe(true);
  });

  it('should advise step 3 when steps 1, 2 and 4 are done (order is advised, not imposed)', () => {
    const entries = readAll('les-bases', 'les-institutions', 'les-grands-debats');
    expect(computeJourneyProgress(journey, entries).next?.step.id).toBe('les-partis');
  });

  it('should mark the parties step done only with all parties read', () => {
    expect(stepOf('les-partis', { 'party:zeta': D, 'party:alpha': D }).status).toBe('in-progress');
    expect(stepOf('les-partis', readAll('les-partis')).status).toBe('done');
    expect(stepOf('les-partis', { 'party:zeta': D, 'party:alpha': D }).ratio).toBeCloseTo(2 / 3);
  });

  it('should never produce a locked status (every step has a status in todo | in-progress | done)', () => {
    const progress = computeJourneyProgress(journey, readAll('les-bases', 'les-partis'));
    for (const step of progress.steps) {
      expect(['todo', 'in-progress', 'done']).toContain(step.status);
    }
  });

  it('should count stamps, not done steps, in stampedCount', () => {
    const entries = { ...readAll('les-bases', 'les-institutions'), ...stamps('les-bases') };
    expect(computeJourneyProgress(journey, entries).stampedCount).toBe(1);
  });

  it('should keep a stamp when a new party is added and report 1 new item', () => {
    const entries = { ...readAll('les-partis'), ...stamps('les-partis') };
    const grown = buildJourney(
      catalogFactory({
        parties: [...catalogFactory().parties, partyFactory({ id: 'nouveau', name: 'Nouveau' })],
      })
    );
    const step = stepOf('les-partis', entries, grown);
    expect(step.stamped).toBe(true);
    expect(step.status).toBe('in-progress');
    expect(step.newItems).toBe(1);
    expect(step.nextItem?.key).toBe('party:nouveau');
  });

  it('should give as next item the first unread one in step order', () => {
    expect(stepOf('les-partis', { 'party:zeta': D }).nextItem?.key).toBe('party:alpha');
    expect(stepOf('les-partis', readAll('les-partis')).nextItem).toBeNull();
  });

  it('should ignore read keys of contents that no longer exist', () => {
    const step = stepOf('les-partis', { 'party:parti-retire': D, 'party:zeta': D });
    expect(step.readCount).toBe(1);
    expect(step.total).toBe(3);
  });

  it('should be finished when the six stamps are acquired', () => {
    const all = stamps(...journey.map((s) => s.id));
    expect(computeJourneyProgress(journey, all).finished).toBe(true);
    expect(computeJourneyProgress(journey, stamps('les-bases')).finished).toBe(false);
  });

  it('should list complete steps whose stamp is not recorded yet', () => {
    const entries = { ...readAll('les-bases', 'les-partis'), ...stamps('les-bases') };
    expect(stampsToAward(journey, entries)).toEqual(['les-partis']);
  });

  it('should not award a stamp to a step without content', () => {
    const empty = buildJourney(catalogFactory({ parties: [] }));
    expect(stampsToAward(empty, {})).toEqual([]);
  });

  it('should consider the quiz complete only when every question has an entry, null included', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }];
    expect(isQuizComplete(questions, { q1: 2 })).toBe(false);
    expect(isQuizComplete(questions, { q1: 2, q2: null })).toBe(true);
    expect(isQuizComplete([], {})).toBe(false);
  });
});
