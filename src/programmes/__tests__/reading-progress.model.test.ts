import {
  contentKey,
  isRead,
  mergeEntries,
  migrateLegacyGuideIds,
  parseContentKey,
  sanitizeEntries,
} from '@/src/programmes/models/reading-progress.model';

const D1 = '2026-11-04T10:00:00.000Z';
const D2 = '2026-11-05T10:00:00.000Z';

describe('Feature: registre de contenus lus', () => {
  it('should build typed keys for guide, party, debate, election, quiz and stamp', () => {
    expect(contentKey.guide('institutions')).toBe('guide:institutions');
    expect(contentKey.party('lfi')).toBe('party:lfi');
    expect(contentKey.debate('economie')).toBe('debate:economie');
    expect(contentKey.election('presidentielle-2027')).toBe('election:presidentielle-2027');
    expect(contentKey.quizDone).toBe('quiz:done');
    expect(contentKey.stamp('les-bases')).toBe('stamp:les-bases');
  });

  it('should parse a well-formed key into its type and id', () => {
    expect(parseContentKey('party:lfi')).toEqual({ type: 'party', id: 'lfi' });
    expect(parseContentKey('quiz:done')).toEqual({ type: 'quiz', id: 'done' });
  });

  it('should reject malformed keys (missing type, uppercase, spaces, empty id)', () => {
    for (const bad of ['lfi', ':lfi', 'party:', 'party:LFI', 'party:l fi', 'Party:lfi', 'a:b:c']) {
      expect(parseContentKey(bad), bad).toBeNull();
    }
  });

  it('should keep only well-formed keys with valid ISO dates when sanitizing', () => {
    expect(
      sanitizeEntries({
        'guide:institutions': D1,
        'party:LFI': D1,
        'party:rn': 'hier',
        'party:ps': 42,
      })
    ).toEqual({ 'guide:institutions': D1 });
  });

  it('should keep well-formed keys of an unknown type when sanitizing', () => {
    expect(sanitizeEntries({ 'future:thing': D1 })).toEqual({ 'future:thing': D1 });
  });

  it('should return an empty registry for non-object stored values', () => {
    for (const bad of [null, undefined, 'x', 12, ['guide:a']]) {
      expect(sanitizeEntries(bad)).toEqual({});
    }
  });

  it('should keep the earliest date when merging two registries', () => {
    expect(
      mergeEntries({ 'guide:a': D2, 'guide:b': D1 }, { 'guide:a': D1, 'guide:c': D2 })
    ).toEqual({ 'guide:a': D1, 'guide:b': D1, 'guide:c': D2 });
  });

  it('should migrate legacy guide ids to guide:<id> keys dated now', () => {
    expect(migrateLegacyGuideIds(['institutions', 'budget-dette'], D1)).toEqual({
      'guide:institutions': D1,
      'guide:budget-dette': D1,
    });
  });

  it('should ignore non-string legacy ids during migration', () => {
    expect(migrateLegacyGuideIds(['institutions', 3, null, 'Bad Id'], D1)).toEqual({
      'guide:institutions': D1,
    });
    expect(migrateLegacyGuideIds('nope', D1)).toEqual({});
  });

  it('should tell whether a key is read', () => {
    expect(isRead({ 'guide:a': D1 }, 'guide:a')).toBe(true);
    expect(isRead({}, 'guide:a')).toBe(false);
  });
});
