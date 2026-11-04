import {
  describeLean,
  explainAxisPosition,
  groupByPull,
} from '@/src/programmes/models/axis-explanation.service';
import type { AxisContribution } from '@/src/programmes/models/axis-explanation.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';

const question = (id: string, axis: Question['axis'], direction: 1 | -1): Question => ({
  id,
  theme: 'economie',
  statement: `Énoncé ${id}`,
  shortLabel: '',
  help: '',
  axis,
  direction,
});

const questions = [
  question('e1', 'economique', 1),
  question('e2', 'economique', -1),
  question('e3', 'economique', 1),
  question('e4', 'economique', 1),
  question('s1', 'societal', 1),
  question('x1', null, 1),
];

describe("Feature: explication de la position d'un parti sur les axes", () => {
  it('should list, per axis, the questions with a known stance and their contribution', () => {
    const party = partyFactory({ stanceValues: { e1: 2, e2: 2, e3: -2, e4: 1, x1: 2 } });

    const explanation = explainAxisPosition(party, questions);

    expect(
      explanation.economique.items.map((i) => [i.question.id, i.stance.stance, i.contribution])
    ).toEqual([
      ['e1', 2, 1],
      ['e2', 2, -1],
      ['e3', -2, -1],
      ['e4', 1, 0.5],
    ]);
    expect(explanation.economique.position).toBe(-0.12);
    expect(explanation.economique.count).toBe(4);
  });

  it('should ignore unknown stances and questions without axis, and give no position below the minimum', () => {
    const party = partyFactory({ stanceValues: { e1: 2, e2: null, s1: 1, x1: 2 } });

    const explanation = explainAxisPosition(party, questions);

    expect(explanation.economique.items.map((i) => i.question.id)).toEqual(['e1']);
    expect(explanation.economique).toMatchObject({ position: null, count: 1 });
    expect(explanation.societal.count).toBe(1);
    expect(explanation.europe).toMatchObject({ items: [], position: null, count: 0 });
  });
});

const explanationOf = (position: number | null, count = 5) => ({ items: [], position, count });

describe('Feature: explication du placement sur les axes', () => {
  it('should describe a position under 0.2 as centred, without side', () => {
    expect(describeLean(explanationOf(0.19))).toEqual({
      kind: 'placed',
      strength: 'centre',
      side: null,
    });
  });
});

describe('Feature: explication du placement sur les axes (seuils)', () => {
  it('should describe 0.2 as "plutôt" toward the positive pole', () => {
    expect(describeLean(explanationOf(0.2))).toEqual({
      kind: 'placed',
      strength: 'plutot',
      side: 'positive',
    });
  });
});

describe('Feature: explication du placement sur les axes (force et côté)', () => {
  it('should describe 0.59 as "plutôt" and 0.6 as "nettement"', () => {
    expect(describeLean(explanationOf(0.59))).toMatchObject({ strength: 'plutot' });
    expect(describeLean(explanationOf(0.6))).toMatchObject({ strength: 'nettement' });
  });

  it('should describe negative positions toward the negative pole', () => {
    expect(describeLean(explanationOf(-0.2))).toEqual({
      kind: 'placed',
      strength: 'plutot',
      side: 'negative',
    });
    expect(describeLean(explanationOf(-0.6))).toMatchObject({
      strength: 'nettement',
      side: 'negative',
    });
  });

  it('should describe a null position as unplaced, with the known count and the minimum', () => {
    expect(describeLean(explanationOf(null, 3))).toEqual({
      kind: 'unplaced',
      count: 3,
      minimum: 4,
    });
  });
});

describe('Feature: regroupement des affirmations par sens', () => {
  const item = (id: string, contribution: number) =>
    ({ question: question(id, 'economique', 1), contribution }) as AxisContribution;

  it('should split by pull direction and keep the questionnaire order', () => {
    const groups = groupByPull([
      item('a', 1),
      item('b', -0.5),
      item('c', 0),
      item('d', 0.5),
      item('e', -1),
    ]);

    expect(groups.positive.map((i) => i.question.id)).toEqual(['a', 'd']);
    expect(groups.negative.map((i) => i.question.id)).toEqual(['b', 'e']);
    expect(groups.neutral.map((i) => i.question.id)).toEqual(['c']);
  });

  it('should return empty groups when there is nothing to group', () => {
    expect(groupByPull([])).toEqual({ negative: [], positive: [], neutral: [] });
  });
});
