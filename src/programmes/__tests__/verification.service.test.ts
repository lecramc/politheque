import type { Source } from '@/src/programmes/models/programme.model';
import { hasPrimarySource, verificationLevel } from '@/src/programmes/models/verification.service';

const source = (url: string, kind: Source['kind'] = 'presse'): Source => ({
  title: 'Titre',
  url,
  date: '2026-01',
  kind,
});

describe('Feature: niveau de vérification', () => {
  it('should flag an unsourced item', () => {
    expect(verificationLevel([])).toBe('non-sourcee');
  });

  it('should not count two pages of the same site as cross-checked', () => {
    expect(
      verificationLevel([source('https://www.lemonde.fr/a'), source('https://lemonde.fr/b')])
    ).toBe('source-unique');
  });

  it('should not count two subdomains of the same site as cross-checked', () => {
    expect(
      verificationLevel([
        source('https://www.lemonde.fr/a'),
        source('https://abonnes.lemonde.fr/b'),
      ])
    ).toBe('source-unique');
    expect(
      verificationLevel([
        source('https://www.insee.fr/a', 'statistique'),
        source('https://www.service-public.gouv.fr/b', 'statistique'),
      ])
    ).toBe('croisee');
  });

  it('should count two independent sites as cross-checked', () => {
    expect(
      verificationLevel([
        source('https://parti.fr/programme', 'programme'),
        source('https://www.lemonde.fr/a'),
      ])
    ).toBe('croisee');
  });

  it('should not count two sites of the same party as cross-checked', () => {
    expect(
      verificationLevel([
        source('https://parti.fr/programme', 'programme'),
        source('https://candidat2027.fr', 'declaration'),
      ])
    ).toBe('source-unique');
  });

  it('should detect a primary source', () => {
    expect(hasPrimarySource([source('https://parti.fr', 'programme')])).toBe(true);
    expect(hasPrimarySource([source('https://lemonde.fr')])).toBe(false);
  });
});
