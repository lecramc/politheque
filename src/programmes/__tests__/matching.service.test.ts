import {
  agreementsWith,
  computeAxisPosition,
  computeProximity,
  rankParties,
} from '@/src/programmes/models/matching.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';

const question = (id: string, axis: Question['axis'], direction: 1 | -1): Question => ({
  id,
  theme: 'economie',
  statement: '',
  help: '',
  axis,
  direction,
});

const IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];
const stances = (value: -2 | -1 | 0 | 1 | 2 | null, extra = {}) => ({
  ...Object.fromEntries(IDS.map((id) => [id, value])),
  ...extra,
});
const answers = (value: -2 | -1 | 0 | 1 | 2 | null, extra = {}) => ({
  ...Object.fromEntries(IDS.map((id) => [id, { value, important: false }])),
  ...extra,
});

describe('Feature: proximité avec un parti', () => {
  it('should give 100 when every answer matches the party stance', () => {
    const party = partyFactory({ stanceValues: stances(2) });
    expect(computeProximity(answers(2), party)).toEqual({
      partyId: 'parti-test',
      score: 100,
      comparedCount: 5,
    });
  });

  it('should give 0 when answers are at the opposite end', () => {
    const party = partyFactory({ stanceValues: stances(2) });
    expect(computeProximity(answers(-2), party).score).toBe(0);
  });

  it('should not compute a score below the minimum number of compared questions', () => {
    const party = partyFactory({ stanceValues: { q1: 2, q2: null } });
    const result = computeProximity(answers(2), party);
    expect(result).toEqual({ partyId: 'parti-test', score: null, comparedCount: 1 });
  });

  it('should ignore questions without opinion or without known party stance', () => {
    const party = partyFactory({ stanceValues: stances(2, { q6: null }) });
    const result = computeProximity(
      answers(2, { q6: { value: -2, important: false }, q7: { value: null, important: true } }),
      party
    );
    expect(result.comparedCount).toBe(5);
    expect(result.score).toBe(100);
  });

  it('should weight important questions twice', () => {
    const party = partyFactory({ stanceValues: stances(2) });
    const result = computeProximity(
      {
        ...answers(-2),
        q1: { value: 2, important: true },
        q2: { value: 2, important: true },
        q3: { value: 2, important: true },
      },
      party
    );
    // 3 accords × 2 sur un poids total de 8.
    expect(result.score).toBe(75);
  });

  it('should rank parties from closest to farthest, unknown scores last', () => {
    const near = partyFactory({ id: 'proche', name: 'Proche', stanceValues: stances(1) });
    const far = partyFactory({ id: 'loin', name: 'Loin', stanceValues: stances(-2) });
    const unknown = partyFactory({ id: 'inconnu', name: 'Inconnu', stanceValues: {} });
    const ranking = rankParties(answers(2), [unknown, far, near]);
    expect(ranking.map((r) => r.partyId)).toEqual(['proche', 'loin', 'inconnu']);
  });
});

describe('Feature: position sur les axes', () => {
  it('should apply the question direction and normalise to -1…+1', () => {
    const questions = [question('q1', 'economique', 1), question('q2', 'economique', -1)];
    expect(computeAxisPosition({ q1: 2, q2: -2 }, questions).economique).toBe(1);
  });

  it('should return null for an axis without any answered question', () => {
    const questions = [question('q1', 'economique', 1), question('q2', null, 1)];
    const position = computeAxisPosition({ q1: null, q2: 2 }, questions);
    expect(position).toEqual({ economique: null, societal: null, europe: null });
  });
});

describe('Feature: accords et désaccords avec un parti', () => {
  it('should separate close answers from opposite ones and ignore unknown stances', () => {
    const party = partyFactory({ stanceValues: { q1: 2, q2: -2, q3: null, q4: 0 } });
    const questions = ['q1', 'q2', 'q3', 'q4'].map((id) => question(id, null, 1));
    const result = agreementsWith(
      {
        q1: { value: 1, important: false },
        q2: { value: 2, important: false },
        q3: { value: 2, important: false },
        q4: { value: 2, important: false },
      },
      party,
      questions
    );
    expect(result.agree.map((q) => q.id)).toEqual(['q1']);
    expect(result.disagree.map((q) => q.id)).toEqual(['q2']);
  });
});
