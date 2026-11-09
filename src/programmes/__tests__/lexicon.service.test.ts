import { lexiconGroups, LEXICON_NUMBER_GROUP } from '@/src/programmes/models/lexicon.service';
import type { LexiconEntry } from '@/src/programmes/models/programme.model';

const entry = (id: string, term: string): LexiconEntry => ({
  id,
  term,
  definition: '',
  more: [],
  related: [],
  sources: [],
  lastVerified: '2026-11-08',
});

describe('Feature: lexique en ordre alphabétique', () => {
  it('should sort terms alphabetically in French, ignoring accents and case', () => {
    const groups = lexiconGroups([
      entry('r', 'Référendum'),
      entry('q', 'Quinquennat'),
      entry('e', 'Ordonnance'),
      entry('d', 'dissolution'),
    ]);
    expect(groups.flatMap((g) => g.entries.map((e) => e.id))).toEqual(['d', 'e', 'q', 'r']);
  });

  it('should group terms by their first letter, without accent', () => {
    const groups = lexiconGroups([
      entry('1', 'Élection'),
      entry('2', 'Ecologie'),
      entry('3', 'Loi'),
    ]);
    expect(groups.map((g) => [g.letter, g.entries.length])).toEqual([
      ['E', 2],
      ['L', 1],
    ]);
  });

  it('should put terms starting with a digit first, in their own group', () => {
    const groups = lexiconGroups([entry('a', 'Article 16'), entry('b', '49.3')]);
    expect(groups[0]).toMatchObject({ letter: LEXICON_NUMBER_GROUP });
    expect(groups[0].entries.map((e) => e.id)).toEqual(['b']);
  });

  it('should give each group an anchor id usable in a URL', () => {
    const groups = lexiconGroups([entry('a', 'Article 16'), entry('b', '49.3')]);
    expect(groups.map((g) => g.anchor)).toEqual(['lettre-0-9', 'lettre-a']);
  });

  it('should not modify the input array', () => {
    const input = [entry('b', 'B'), entry('a', 'A')];
    lexiconGroups(input);
    expect(input.map((e) => e.id)).toEqual(['b', 'a']);
  });
});
