import type { PartyProximity } from '@/src/programmes/models/matching.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Question } from '@/src/programmes/models/programme.model';
import {
  isFewCompared,
  presentRanking,
  scoreMargin,
  separatingQuestions,
} from '@/src/programmes/models/results-ranking.service';

const prox = (partyId: string, rawScore: number | null, comparedCount = 30): PartyProximity => ({
  partyId,
  rawScore,
  score: rawScore === null ? null : Math.round(rawScore),
  comparedCount,
});

describe("Feature: marge d'incertitude du score", () => {
  it('should be 5 points on a full questionnaire and never below', () => {
    expect(scoreMargin(31, 31)).toBe(5);
    expect(scoreMargin(40, 31)).toBe(5);
  });

  it('should widen when the user answered fewer questions', () => {
    expect(scoreMargin(15, 31)).toBe(7);
    expect(scoreMargin(8, 31)).toBe(10);
  });

  it('should take the size of the questionnaire as reference, not a fixed count', () => {
    expect(scoreMargin(10, 40)).toBe(10);
    expect(scoreMargin(10, 20)).toBe(7);
  });

  it('should depend on the answers only, so it is the same for every party', () => {
    expect(scoreMargin(20, 31)).toBe(scoreMargin(20, 31));
  });
});

describe('Feature: classement présenté', () => {
  it('should give the same rank to equal rounded scores and flag them as tied', () => {
    const { items } = presentRanking([prox('a', 80.4), prox('b', 79.6), prox('c', 60)], 31, 31);
    expect(items.map((i) => [i.partyId, i.rank, i.tied])).toEqual([
      ['a', 1, true],
      ['b', 1, true],
      ['c', 3, false],
    ]);
  });

  it('should not rank parties without a score and leave them untied', () => {
    const { items } = presentRanking([prox('a', 70), prox('x', null, 2)], 31, 31);
    expect(items[1]).toMatchObject({ partyId: 'x', rank: null, tied: false });
  });

  it('should gather in the leading group the parties within the margin of the first', () => {
    const result = presentRanking(
      [prox('a', 80), prox('b', 76), prox('c', 75.5), prox('d', 50)],
      31,
      31
    );
    expect(result.margin).toBe(5);
    expect(result.leaders).toEqual(['a', 'b', 'c']);
  });

  it('should have a single leader when the first is far ahead', () => {
    expect(presentRanking([prox('a', 90), prox('b', 70)], 31, 31).leaders).toEqual(['a']);
  });

  it('should have no leading group when nobody has a score', () => {
    expect(presentRanking([prox('a', null, 1)], 31, 31).leaders).toEqual([]);
  });
});

describe('Feature: seuil relatif de comparaison', () => {
  it('should flag a party compared on less than 80 % of the answers', () => {
    expect(isFewCompared(23, 30)).toBe(true);
    expect(isFewCompared(24, 30)).toBe(false);
    expect(isFewCompared(30, 30)).toBe(false);
  });

  it('should not flag anything without answers', () => {
    expect(isFewCompared(0, 0)).toBe(false);
  });
});

const question = (id: string): Question => ({
  id,
  theme: 'economie',
  statement: `Affirmation ${id}`,
  shortLabel: id,
  help: '',
  axis: null,
  direction: 1,
});

describe('Feature: ce qui départage les partis de tête', () => {
  const questions = [question('q1'), question('q2'), question('q3'), question('q4')];
  const a = partyFactory({ id: 'a', stanceValues: { q1: 2, q2: 1, q3: -2, q4: null } });
  const b = partyFactory({ id: 'b', stanceValues: { q1: 2, q2: -1, q3: 2, q4: 2 } });
  const answers = {
    q1: { value: 2 as const, important: false },
    q2: { value: 0 as const, important: false },
    q3: { value: 1 as const, important: false },
    q4: { value: 2 as const, important: false },
  };

  it('should list the answered questions where the leaders differ by at least 2, widest first', () => {
    const result = separatingQuestions(answers, [a, b], questions);
    expect(result.map((r) => r.question.id)).toEqual(['q3', 'q2']);
    expect(result[0]).toMatchObject({
      userValue: 1,
      stances: [
        { partyId: 'a', stance: -2 },
        { partyId: 'b', stance: 2 },
      ],
    });
  });

  it('should ignore questions the user skipped or where fewer than two leaders have a stance', () => {
    const skipped = { ...answers, q3: { value: null, important: false } };
    expect(separatingQuestions(skipped, [a, b], questions).map((r) => r.question.id)).toEqual([
      'q2',
    ]);
  });

  it('should return nothing for a single leader', () => {
    expect(separatingQuestions(answers, [a], questions)).toEqual([]);
  });

  it('should keep at most the requested number of questions', () => {
    expect(separatingQuestions(answers, [a, b], questions, 1)).toHaveLength(1);
  });
});
