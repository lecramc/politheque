import { QUESTIONS } from '@/src/programmes/data/questions';
import {
  ANSWER_CODE_V1_IDS,
  buildPersonalLink,
  decodeAnswers,
  encodeAnswers,
  INVALID_LINK_MESSAGE,
  readCodeFromHash,
} from '@/src/programmes/models/answer-link.service';
import type { Answers } from '@/src/programmes/models/matching.service';

describe('Feature: lien personnel de résultats', () => {
  it('should give back the same answers after an encode then a decode', () => {
    const answers: Answers = {
      'q01-isf': { value: 2, important: true },
      'q02-depenses': { value: -2, important: false },
      'q25-successions': { value: null, important: false },
      'q26-nationalisations': { value: 0, important: true },
    };
    const result = decodeAnswers(encodeAnswers(answers));
    expect(result).toEqual({ ok: true, answers });
  });

  it('should give a compact versioned code of one character per question', () => {
    const code = encodeAnswers({ 'q01-isf': { value: 2, important: true } });
    expect(code).toBe(`v1.b${'6'.repeat(29)}`);
  });

  it('should keep a stable code when the order of questions.ts changes', () => {
    const answers: Answers = { 'q02-depenses': { value: 1, important: false } };
    const before = encodeAnswers(answers);
    QUESTIONS.reverse();
    const after = encodeAnswers(answers);
    QUESTIONS.reverse();
    expect(after).toBe(before);
    expect(before.split('.')[1][1]).toBe('3');
  });

  it('should pin the v1 order of the 30 questions', () => {
    expect(ANSWER_CODE_V1_IDS).toHaveLength(30);
    expect(ANSWER_CODE_V1_IDS[0]).toBe('q01-isf');
    expect(ANSWER_CODE_V1_IDS[29]).toBe('q31-voile-sport');
  });

  it('should cover every question of the questionnaire in v1', () => {
    // Si ce test échoue : une question a été ajoutée, il faut un code v2 (les liens v1 restent lisibles).
    expect(QUESTIONS.map((q) => q.id).filter((id) => !ANSWER_CODE_V1_IDS.includes(id))).toEqual([]);
  });

  it.each([
    ['too short', 'v1.0123'],
    ['too long', `v1.${'0'.repeat(31)}`],
    ['not hexadecimal', `v1.${'z'.repeat(30)}`],
    ['out of range', `v1.${'e'.repeat(30)}`],
    ['empty', ''],
    ['without a version', '0'.repeat(30)],
  ])('should ignore a code that is %s, with a neutral message', (_label, code) => {
    expect(decodeAnswers(code)).toEqual({
      ok: false,
      reason: 'invalid',
      message: INVALID_LINK_MESSAGE,
    });
  });

  it('should ignore a code of another version', () => {
    expect(decodeAnswers(`v2.${'0'.repeat(30)}`)).toMatchObject({ ok: false, reason: 'version' });
  });

  it('should build a personal link whose answers live in the fragment only', () => {
    const link = buildPersonalLink('https://exemple.fr', {});
    const url = new URL(link);
    expect(url.pathname).toBe('/me-situer/resultats');
    expect(url.search).toBe('');
    expect(url.hash).toBe(`#r=v1.${'6'.repeat(30)}`);
  });

  it('should read the code back from location.hash', () => {
    expect(readCodeFromHash('#r=v1.abc')).toBe('v1.abc');
    expect(readCodeFromHash('')).toBeNull();
    expect(readCodeFromHash('#autre=1')).toBeNull();
  });
});
