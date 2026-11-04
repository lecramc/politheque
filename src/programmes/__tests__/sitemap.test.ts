import { SITE_URL } from '@/src/core/config/app';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { expandRoutes, type SiteUrl } from '@/src/programmes/models/seo/site-routes';
import { buildSitemapXml } from '@/src/programmes/models/seo/sitemap';

const urls = expandRoutes(buildStaticCatalog());
const xml = buildSitemapXml(urls);
const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

describe('Feature: sitemap', () => {
  it('should list every indexable URL exactly once', () => {
    const indexable = urls.filter((u) => u.indexable);
    expect(locs).toHaveLength(indexable.length);
    expect(new Set(locs).size).toBe(locs.length);
  });

  it('should not list /passeport, /me-situer/resultats or /parcours/*', () => {
    expect(xml).not.toMatch(/passeport|resultats|parcours/);
  });

  it('should use absolute canonical URLs (no .html, no trailing slash except home, no query)', () => {
    for (const loc of locs) {
      expect(loc.startsWith(SITE_URL)).toBe(true);
      expect(loc).not.toMatch(/\.html|\?|onglet/);
      if (loc !== `${SITE_URL}/`) expect(loc.endsWith('/')).toBe(false);
    }
  });

  it('should write lastmod only when a verification date exists', () => {
    const sample: SiteUrl[] = [
      { pattern: '/methodologie', path: '/methodologie', indexable: true, lastmod: null },
      { pattern: '/partis', path: '/partis', indexable: true, lastmod: '2026-11-03' },
    ];
    const out = buildSitemapXml(sample);
    expect(out.match(/<lastmod>/g)).toHaveLength(1);
    expect(out).toContain('<lastmod>2026-11-03</lastmod>');
  });

  it('should escape XML special characters in URLs', () => {
    const out = buildSitemapXml([
      { pattern: '/partis/[id]', path: '/partis/a&b', indexable: true, lastmod: null },
    ]);
    expect(out).toContain('a&amp;b');
  });

  it('should produce well-formed XML (urlset namespace, one loc per url)', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<url>/g)?.length).toBe(xml.match(/<\/url>/g)?.length);
    expect(xml).not.toMatch(/<priority>|<changefreq>/);
  });
});
