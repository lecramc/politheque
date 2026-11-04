import { SITE_URL } from '@/src/core/config/app';
import { formatLongDate, maxIsoDate } from '@/src/programmes/models/seo/dates';
import { absoluteUrl, fillPattern } from '@/src/programmes/models/seo/site-routes';

describe('Feature: URL canoniques', () => {
  it('should define SITE_URL as https origin without trailing slash', () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it('should build the home absolute URL with a single trailing slash', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
  });

  it('should build other absolute URLs without trailing slash, extension or query', () => {
    expect(absoluteUrl('/partis/rn/histoire')).toBe(`${SITE_URL}/partis/rn/histoire`);
    expect(() => absoluteUrl('/partis/rn?onglet=histoire')).toThrow();
    expect(() => absoluteUrl('/partis/rn.html')).toThrow();
    expect(() => absoluteUrl('/partis/')).toThrow();
  });

  it('should fill a route pattern with its params', () => {
    expect(fillPattern('/partis/[id]/histoire', { id: 'rn' })).toBe('/partis/rn/histoire');
    expect(fillPattern('/comprendre', {})).toBe('/comprendre');
  });
});

describe('Feature: dates de métadonnées', () => {
  it('should format an ISO date as a long French date', () => {
    expect(formatLongDate('2026-11-03')).toBe('3 novembre 2026');
    expect(formatLongDate('2026-01-01')).toBe('1er janvier 2026');
  });

  it('should keep the latest ISO date and ignore missing ones', () => {
    expect(maxIsoDate(['2026-10-01', null, '2026-11-03', undefined])).toBe('2026-11-03');
    expect(maxIsoDate([null])).toBeNull();
  });
});
