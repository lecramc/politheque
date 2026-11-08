import { QUESTIONS } from '@/src/programmes/data/questions';
import {
  ANSWER_CODE_V1_IDS,
  ANSWER_CODE_V2_IDS,
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
    expect(code).toBe(`v2.b${'6'.repeat(30)}`);
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

  it('should pin the v2 order: v1 without q23, then q36 and q39', () => {
    expect(ANSWER_CODE_V2_IDS).toHaveLength(31);
    expect(ANSWER_CODE_V2_IDS.slice(0, 27)).toEqual(ANSWER_CODE_V1_IDS.slice(0, 27));
    expect(ANSWER_CODE_V2_IDS.slice(27)).toEqual([
      'q24-proportionnelle',
      'q31-voile-sport',
      'q36-fonctionnaires',
      'q39-encadrement-loyers',
    ]);
    expect(ANSWER_CODE_V2_IDS).not.toContain('q23-referendum');
  });

  it('should cover every question of the questionnaire in v2', () => {
    // Si ce test échoue : une question a été ajoutée, il faut un code v3 (les liens v1 et v2 restent lisibles).
    expect(QUESTIONS.map((q) => q.id).filter((id) => !ANSWER_CODE_V2_IDS.includes(id))).toEqual([]);
    expect([...ANSWER_CODE_V2_IDS].sort()).toEqual(QUESTIONS.map((q) => q.id).sort());
  });

  it('should still read a v1 link shared before v3, ignoring the removed q23', () => {
    const v1 = ANSWER_CODE_V1_IDS.map((id) =>
      id === 'q23-referendum' ? 'd' : id === 'q01-isf' ? 'b' : '6'
    ).join('');
    const result = decodeAnswers(`v1.${v1}`);
    expect(result).toEqual({
      ok: true,
      answers: { 'q01-isf': { value: 2, important: true } },
    });
  });

  it('should read a v1 link at the question of the v1 order, not of the v2 order', () => {
    // q24 est en 29e position en v1 (index 28), en 28e en v2 : un décalage les ferait lire de travers.
    const v1 = ANSWER_CODE_V1_IDS.map((id) => (id === 'q24-proportionnelle' ? '0' : '6')).join('');
    const decoded = decodeAnswers(`v1.${v1}`);
    expect(decoded).toEqual({
      ok: true,
      answers: { 'q24-proportionnelle': { value: -2, important: false } },
    });
  });

  it('should leave the new questions unanswered when reading a v1 link', () => {
    const result = decodeAnswers(`v1.${'0'.repeat(30)}`);
    expect(result.ok && Object.keys(result.answers)).not.toContain('q36-fonctionnaires');
    expect(result.ok && Object.keys(result.answers)).not.toContain('q23-referendum');
  });

  it.each([
    ['too short', 'v2.0123'],
    ['too long', `v2.${'0'.repeat(32)}`],
    ['not hexadecimal', `v2.${'z'.repeat(31)}`],
    ['out of range', `v2.${'e'.repeat(31)}`],
    ['empty', ''],
    ['without a version', '0'.repeat(31)],
    ['a v1 code with the length of a v2 code', `v1.${'0'.repeat(31)}`],
    ['a v2 code with the length of a v1 code', `v2.${'0'.repeat(30)}`],
  ])('should ignore a code that is %s, with a neutral message', (_label, code) => {
    expect(decodeAnswers(code)).toEqual({
      ok: false,
      reason: 'invalid',
      message: INVALID_LINK_MESSAGE,
    });
  });

  it('should ignore a code of another version', () => {
    expect(decodeAnswers(`v3.${'0'.repeat(31)}`)).toMatchObject({ ok: false, reason: 'version' });
  });

  it('should build a personal link whose answers live in the fragment only', () => {
    const link = buildPersonalLink('https://exemple.fr', {});
    const url = new URL(link);
    expect(url.pathname).toBe('/me-situer/resultats');
    expect(url.search).toBe('');
    expect(url.hash).toBe(`#r=v2.${'6'.repeat(31)}`);
  });

  it('should read the code back from location.hash', () => {
    expect(readCodeFromHash('#r=v2.abc')).toBe('v2.abc');
    expect(readCodeFromHash('')).toBeNull();
    expect(readCodeFromHash('#autre=1')).toBeNull();
  });
});
