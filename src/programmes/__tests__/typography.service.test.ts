import { frenchTypography } from '@/src/programmes/models/typography.service';

describe('Feature: typographie française', () => {
  it('should use a no-break space before a colon', () => {
    expect(frenchTypography('Candidat : Roussel')).toBe('Candidat : Roussel');
  });

  it('should use a narrow no-break space before ; ? !', () => {
    expect(frenchTypography('Quoi ? Oui ! Non ;')).toBe('Quoi ? Oui ! Non ;');
  });

  it('should bind guillemets to their content', () => {
    expect(frenchTypography('Le « mot » dit')).toBe('Le « mot » dit');
  });

  it('should leave URLs and unspaced punctuation untouched', () => {
    const text = 'Voir https://exemple.fr/a?b=1 : ok, 12:30';
    expect(frenchTypography(text)).toBe('Voir https://exemple.fr/a?b=1 : ok, 12:30');
  });

  it('should be idempotent', () => {
    const once = frenchTypography('A : b ? « c »');
    expect(frenchTypography(once)).toBe(once);
  });
});
