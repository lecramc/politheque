import { SITE_URL } from '@/src/core/config/app';
import { auditHtml, type HtmlAuditExpectation } from '@/src/programmes/models/seo/html-audit';

const DESC =
  'Description factuelle de la page, suffisamment longue pour passer le contrôle de longueur minimal.';

const page = (overrides: { head?: string; body?: string } = {}) => `<!DOCTYPE html><html><head>
<title>Titre · Polithèque</title>
<meta name="description" content="${DESC}"/>
<link rel="canonical" href="${SITE_URL}/partis/rn"/>
<meta name="robots" content="index, follow"/>
<meta property="og:title" content="t"/><meta property="og:description" content="d"/>
<meta property="og:url" content="${SITE_URL}/partis/rn"/><meta property="og:image" content="${SITE_URL}/og.png"/>
<meta property="og:type" content="article"/>
<script type="application/ld+json">{"@context":"https://schema.org"}</script>
${overrides.head ?? ''}
</head><body><h1>Parti</h1><h2>Section</h2>${overrides.body ?? ''}</body></html>`;

const expected = { path: '/partis/rn', indexable: true };
const rules = (html: string, exp: HtmlAuditExpectation = expected) =>
  auditHtml(html, exp).map((i) => i.rule);

describe('Feature: contrôle du HTML exporté', () => {
  it('should accept a page with one title, one description, one canonical and valid JSON-LD', () => {
    expect(auditHtml(page(), expected)).toEqual([]);
  });

  it('should report two title tags', () => {
    expect(rules(page({ head: '<title>Autre</title>' }))).toContain('title');
  });

  it('should report a canonical that differs from the expected URL', () => {
    expect(rules(page(), { path: '/partis/lfi', indexable: true })).toContain('canonical');
  });

  it('should report a missing noindex on a non-indexable page', () => {
    expect(rules(page(), { ...expected, indexable: false })).toContain('robots');
  });

  it('should report a noindex on an indexable page', () => {
    const html = page().replace('index, follow', 'noindex, follow');
    expect(rules(html)).toContain('robots');
  });

  it('should report a JSON-LD block that is not valid JSON', () => {
    expect(rules(page({ head: '<script type="application/ld+json">{oups</script>' }))).toContain(
      'json-ld'
    );
  });

  it('should report an internal link carrying ?onglet=', () => {
    expect(rules(page({ body: '<a href="/partis/rn?onglet=histoire">x</a>' }))).toContain('onglet');
  });

  it('should report zero or several h1', () => {
    expect(rules(page({ body: '<h1>Autre</h1>' }))).toContain('h1');
    expect(rules(page().replace('<h1>Parti</h1>', ''))).toContain('h1');
  });

  it('should report a content page without any h2', () => {
    expect(rules(page().replace('<h2>Section</h2>', ''), { ...expected, content: true })).toContain(
      'h2'
    );
  });

  it('should measure the description once HTML entities are decoded', () => {
    const encoded = DESC.replace('Description', 'L&#x27;analyse &amp; la description');
    const html = page().replace(DESC, encoded);
    expect(rules(html)).not.toContain('description');
  });

  it('should not require a single h1 on a non-indexable page', () => {
    const html = page().replace('<h1>Parti</h1>', '').replace('index, follow', 'noindex, follow');
    expect(rules(html, { ...expected, indexable: false })).not.toContain('h1');
  });
});
