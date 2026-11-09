import { figureColumns, splitFigure } from '@/src/programmes/models/key-figure.service';

describe('Feature: grille des chiffres clés', () => {
  it('should use three columns when the last row is not a lone card', () => {
    expect([3, 5, 6].map(figureColumns)).toEqual([3, 3, 3]);
  });

  it('should use two columns when a third column would leave one orphan card', () => {
    expect([4, 7].map(figureColumns)).toEqual([2, 2]);
  });
});

describe('Feature: chiffre clé, valeur et précision', () => {
  it('should keep a short value as the headline', () => {
    expect(splitFigure('384 230')).toEqual({ headline: '384 230', detail: null });
  });

  it('should split at the first opening parenthesis', () => {
    expect(splitFigure('384 230 (+11 % par rapport à 2024)')).toEqual({
      headline: '384 230',
      detail: '+11 % par rapport à 2024',
    });
  });

  it('should split at the first semicolon', () => {
    expect(splitFigure('9,4 % ; au plus haut depuis 2021')).toEqual({
      headline: '9,4 %',
      detail: 'au plus haut depuis 2021',
    });
  });

  it('should split at « , soit »', () => {
    expect(splitFigure('1,2 million, soit 3 % de la population')).toEqual({
      headline: '1,2 million',
      detail: 'soit 3 % de la population',
    });
  });

  it('should split at the earliest separator', () => {
    expect(splitFigure('12 (a ; b)')).toEqual({ headline: '12', detail: 'a ; b' });
  });

  it('should not lose any text of the published value', () => {
    const value = '384 230 (+11 % ; janvier 2026)';
    const { headline, detail } = splitFigure(value);
    expect(`${headline} ${detail}`.replace(/[()]/g, '')).toContain('384 230');
    expect(detail).toContain('janvier 2026');
  });

  it('should keep the whole value as headline when nothing precedes the separator', () => {
    expect(splitFigure('(estimation)')).toEqual({ headline: '(estimation)', detail: null });
  });
});
