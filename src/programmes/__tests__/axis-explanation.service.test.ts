import { explainAxisPosition } from '@/src/programmes/models/axis-explanation.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';

const question = (id: string, axis: Question['axis'], direction: 1 | -1): Question => ({
  id,
  theme: 'economie',
  statement: `Énoncé ${id}`,
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
