import { calculatedDateText } from '@/src/programmes/models/contenus-2027';

describe('Feature: affichage d’une date calculée', () => {
  it('should write the weekday and the long date', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-03-12', rule: 'r' })).toBe(
      'vendredi 12 mars 2027'
    );
  });

  it('should add the deadline time when there is one', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-03-12', rule: 'r', time: '18:00' })).toBe(
      'vendredi 12 mars 2027, 18 h'
    );
  });

  it('should write the first of the month as « 1er »', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-05-01', rule: 'r' })).toBe(
      'samedi 1er mai 2027'
    );
  });
});
