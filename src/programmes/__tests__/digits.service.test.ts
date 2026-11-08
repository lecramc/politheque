import { isIsolatedNumber, splitDates, splitDigits } from '@/src/programmes/models/digits.service';

describe('Feature: chiffres sans zéro barré', () => {
  it('should split a text into plain runs and digit runs', () => {
    expect(splitDigits('Dimanche 12 avril 2027')).toEqual([
      { text: 'Dimanche ', digits: false },
      { text: '12', digits: true },
      { text: ' avril ', digits: false },
      { text: '2027', digits: true },
    ]);
  });

  it('should keep a number with its separators in one run', () => {
    expect(splitDigits('384 230,5 %')).toEqual([
      { text: '384 230,5', digits: true },
      { text: ' %', digits: false },
    ]);
  });

  it('should return a single plain run when there is no digit', () => {
    expect(splitDigits('Bientôt')).toEqual([{ text: 'Bientôt', digits: false }]);
  });

  it('should return nothing for an empty text', () => {
    expect(splitDigits('')).toEqual([]);
  });
});

describe('Feature: dates sans zéro barré dans le texte courant', () => {
  it('should only mark years and the day before a month name', () => {
    expect(splitDates('Fiche vérifiée le 3 novembre 2026, 100 produits')).toEqual([
      { text: 'Fiche vérifiée le ', digits: false },
      { text: '3', digits: true },
      { text: ' novembre ', digits: false },
      { text: '2026', digits: true },
      { text: ', 100 produits', digits: false },
    ]);
  });

  it('should handle the first of the month and a bare year', () => {
    expect(splitDates('1er mars 2022')).toEqual([
      { text: '1', digits: true },
      { text: 'er mars ', digits: false },
      { text: '2022', digits: true },
    ]);
    expect(splitDates('Programme 2027')).toEqual([
      { text: 'Programme ', digits: false },
      { text: '2027', digits: true },
    ]);
  });

  it('should leave other numbers, including ages and amounts, in the body font', () => {
    expect(splitDates('Retraite à 62 ans, 20 ans de travail, 35 h')).toEqual([
      { text: 'Retraite à 62 ans, 20 ans de travail, 35 h', digits: false },
    ]);
  });

  it('should return a single run when there is no date', () => {
    expect(splitDates('Bientôt')).toEqual([{ text: 'Bientôt', digits: false }]);
  });
});

describe('Feature: grands chiffres isolés', () => {
  it('should recognise a text made only of a number', () => {
    for (const text of ['161', 'J-161', '72 %', '384 230,5', '12']) {
      expect(isIsolatedNumber(text)).toBe(true);
    }
  });

  it('should refuse a sentence that contains a number', () => {
    for (const text of [
      '1er tour le dimanche 18 avril 2027 · J-161',
      'Retraite à 62 ans',
      '',
      'Bientôt',
    ]) {
      expect(isIsolatedNumber(text)).toBe(false);
    }
  });
});
