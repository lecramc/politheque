import { asList, normalizeTitle } from '@/src/assemblee/models/extraction/normalize';

describe('Feature: normalisation des titres de scrutin', () => {
  it('should unify typographic and straight apostrophes', () => {
    expect(normalizeTitle('l’ensemble du projet')).toBe(normalizeTitle("l'ensemble du projet"));
  });

  it('should ignore case and surrounding or repeated spaces', () => {
    expect(normalizeTitle("  L'Ensemble   du  projet ")).toBe("l'ensemble du projet");
  });
});

describe('Feature: listes de l’open data', () => {
  it('should read an absent list as empty', () => {
    expect(asList(null)).toEqual([]);
    expect(asList(undefined)).toEqual([]);
  });

  it('should read a lone object as a one-item list', () => {
    expect(asList({ a: 1 })).toEqual([{ a: 1 }]);
  });

  it('should keep an array as is and drop null slots', () => {
    expect(asList([null, { a: 1 }, null])).toEqual([{ a: 1 }]);
  });
});
