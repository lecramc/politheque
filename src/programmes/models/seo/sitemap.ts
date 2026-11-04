import { absoluteUrl, type SiteUrl } from '@/src/programmes/models/seo/site-routes';

const escapeXml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Une <url> par page indexable ; <lastmod> seulement si une vérification réelle est datée. */
export function buildSitemapXml(urls: SiteUrl[]): string {
  const entries = urls
    .filter((u) => u.indexable)
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(u.path))}</loc>\n${
          u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''
        }  </url>`
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}
