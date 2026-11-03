import guide from '@/src/programmes/data/guide.json';
import {
  afterFirstSentence,
  beforeParenthesis,
  firstSentence,
  GUIDE_GROUPS,
  readingMinutes,
} from '@/src/programmes/models/presentation.service';

describe('Feature: formes courtes', () => {
  it('should keep only the first sentence', () => {
    expect(firstSentence('Le parti est fondé en 1972. Il change de nom en 2018.')).toBe(
      'Le parti est fondé en 1972.'
    );
  });

  it('should not cut on abbreviations followed by a lowercase word', () => {
    expect(firstSentence('Environ 6 M. de personnes. Suite.')).toBe('Environ 6 M. de personnes.');
  });

  it('should return what follows the first sentence', () => {
    expect(afterFirstSentence('Première. Deuxième. Troisième.')).toBe('Deuxième. Troisième.');
  });

  it('should drop the parenthesised detail of a label', () => {
    expect(beforeParenthesis('Extrême droite (qualification de la presse)')).toBe('Extrême droite');
  });

  it('should estimate at least one minute of reading', () => {
    expect(readingMinutes(['court'])).toBe(1);
    expect(readingMinutes([Array(600).fill('mot').join(' ')])).toBe(3);
  });

  it('should place every guide section in exactly one group', () => {
    const grouped = GUIDE_GROUPS.flatMap((g) => g.sectionIds).sort();
    expect(grouped).toEqual(guide.map((s) => s.id).sort());
  });
});
