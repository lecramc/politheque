import { AXES } from '@/src/programmes/data/questions';
import {
  buildMailto,
  buildRecapBody,
  formatLongDate,
  MAILTO_MAX_LENGTH,
  MAILTO_SUBJECT,
  type RecapInput,
} from '@/src/programmes/models/results-recap.service';

const input = (overrides: Partial<RecapInput> = {}): RecapInput => ({
  date: new Date(2026, 10, 8),
  ranking: [
    { name: 'Parti B', score: 80, comparedCount: 28 },
    { name: 'Parti A', score: 41, comparedCount: 30 },
    { name: 'Parti C', score: null, comparedCount: 3 },
  ],
  axes: AXES,
  userPosition: { economique: -0.8, societal: 0.1, europe: null },
  link: 'https://exemple.fr/me-situer/resultats#r=v1.abc',
  ...overrides,
});

describe('Feature: récapitulatif par e-mail', () => {
  it('should write the date of the day in full', () => {
    expect(formatLongDate(new Date(2026, 10, 8))).toBe('8 novembre 2026');
    expect(formatLongDate(new Date(2027, 0, 1))).toBe('1er janvier 2027');
  });

  it('should open with the date and the reminder that this is not a voting instruction', () => {
    const body = buildRecapBody(input());
    expect(body.split('\n')[0]).toContain('8 novembre 2026');
    expect(body).toContain(
      'Proximité avec les positions publiques des partis, pas une consigne de vote.'
    );
  });

  it('should list proximities in descending order with the number of compared questions', () => {
    const body = buildRecapBody(input());
    expect(body).toContain('Parti B : 80 % (28 questions comparées)');
    expect(body.indexOf('Parti B : 80 %')).toBeLessThan(body.indexOf('Parti A : 41 %'));
  });

  it('should list the parties that cannot be computed at the end of the proximities', () => {
    const body = buildRecapBody(input());
    expect(body.indexOf('Parti A : 41 %')).toBeLessThan(body.indexOf('Parti C'));
    expect(body).toContain('Parti C : non calculable (3 questions comparées)');
  });

  it('should say in words where the user stands on each axis', () => {
    const body = buildRecapBody(input());
    expect(body).toContain(
      "Économie : Nettement vers « Redistribution et intervention de l'État »"
    );
    expect(body).toContain("Société : Au centre de l'axe");
    expect(body).toContain('Europe : non placé (moins de 4 réponses sur cet axe)');
  });

  it('should end with the personal link and the warning that it holds the answers', () => {
    const lines = buildRecapBody(input()).trimEnd().split('\n');
    expect(lines.at(-2)).toBe('https://exemple.fr/me-situer/resultats#r=v1.abc');
    expect(lines.at(-1)).toBe(
      'Ce lien contient vos réponses : ne le partagez qu’avec qui vous voulez.'
    );
  });

  it('should build a mailto: without recipient, with the subject', () => {
    const url = buildMailto(input());
    expect(url.startsWith('mailto:?subject=')).toBe(true);
    expect(decodeURIComponent(url)).toContain(`subject=${MAILTO_SUBJECT}`);
    expect(MAILTO_SUBJECT).toBe('Mes résultats Polithèque');
  });

  it('should keep the whole mailto: URL under 1800 characters with the ten real party names', () => {
    const names = [
      'Horizons',
      'Les Écologistes',
      'Les Républicains',
      'La France insoumise',
      'Nouvelle Énergie',
      'Parti communiste français',
      'Parti socialiste – Place publique',
      'Reconquête',
      'Rassemblement national',
      'Renaissance',
    ];
    const ranking = names.map((name, i) => ({ name, score: 90 - i * 7, comparedCount: 30 }));
    const url = buildMailto(
      input({
        ranking,
        userPosition: { economique: -0.9, societal: 0.9, europe: -0.9 },
        link: `https://politheque.revaamp.com/me-situer/resultats#r=v1.${'b'.repeat(30)}`,
      })
    );
    expect(url.length).toBeLessThan(MAILTO_MAX_LENGTH);
  });

  it('should not send anything by itself: the URL only contains the mailto scheme', () => {
    expect(buildMailto(input())).not.toMatch(/^https?:/);
  });
});
