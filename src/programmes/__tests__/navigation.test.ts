import { BOTTOM_NAV, NAV } from '@/src/programmes/models/navigation';

const activeOf = (pathname: string) => NAV.find((item) => item.matches(pathname))?.label ?? null;

describe('Feature: navigation à quatre rubriques', () => {
  it('should list the four rubriques in a fixed order', () => {
    expect(NAV.map((item) => [item.label, item.href])).toEqual([
      ['Comprendre', '/comprendre'],
      ['Partis', '/partis'],
      ['Assemblée', '/assemblee'],
      ['Me situer', '/me-situer'],
    ]);
  });

  it('should keep Assemblée active on every page under /assemblee', () => {
    for (const path of ['/assemblee', '/assemblee/scrutins/7', '/assemblee/deputes']) {
      expect(activeOf(path)).toBe('Assemblée');
    }
  });

  it('should keep the other rubriques on their own pages', () => {
    expect(activeOf('/comprendre/comment-une-loi-est-votee')).toBe('Comprendre');
    expect(activeOf('/passeport')).toBe('Comprendre');
    expect(activeOf('/partis/comparer')).toBe('Partis');
    expect(activeOf('/debats/retraites')).toBe('Partis');
    expect(activeOf('/me-situer')).toBe('Me situer');
    expect(activeOf('/')).toBeNull();
  });

  it('should put the home first in the bottom bar, for five tabs', () => {
    expect(BOTTOM_NAV.map((item) => item.label)).toEqual([
      'Accueil',
      'Comprendre',
      'Partis',
      'Assemblée',
      'Me situer',
    ]);
  });
});
