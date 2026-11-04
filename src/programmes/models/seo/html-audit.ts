import { absoluteUrl } from '@/src/programmes/models/seo/site-routes';

export type HtmlAuditExpectation = { path: string; indexable: boolean; content?: boolean };
export type HtmlAuditIssue = { path: string; rule: string; detail: string };

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

const decodeEntities = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const attr = (tag: string, name: string) =>
  decodeEntities(new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? '');

const tags = (html: string, re: RegExp) => html.match(re) ?? [];

/** Contrôle d'un HTML exporté (expressions régulières, sans parseur DOM). */
export function auditHtml(html: string, expected: HtmlAuditExpectation): HtmlAuditIssue[] {
  const issues: HtmlAuditIssue[] = [];
  const report = (rule: string, detail: string) =>
    issues.push({ path: expected.path, rule, detail });
  const canonicalUrl = absoluteUrl(expected.path);

  const titles = tags(html, /<title[^>]*>[\s\S]*?<\/title>/g);
  if (titles.length !== 1 || !/<title[^>]*>[^<]+<\/title>/.test(titles[0])) {
    report('title', `${titles.length} balise(s) <title> (1 attendue, non vide)`);
  }

  const descriptions = tags(html, /<meta[^>]*\bname="description"[^>]*>/g);
  if (descriptions.length !== 1) {
    report('description', `${descriptions.length} meta description (1 attendue)`);
  } else {
    const length = attr(descriptions[0], 'content').length;
    if (length < 50 || length > 160) report('description', `longueur ${length} (50 à 160)`);
  }

  const canonicals = tags(html, /<link[^>]*\brel="canonical"[^>]*>/g);
  if (canonicals.length !== 1) {
    report('canonical', `${canonicals.length} canonical (1 attendu)`);
  } else if (attr(canonicals[0], 'href') !== canonicalUrl) {
    report('canonical', `${attr(canonicals[0], 'href')} au lieu de ${canonicalUrl}`);
  }

  for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
    const found = tags(html, new RegExp(`<meta[^>]*\\bproperty="${property}"[^>]*>`, 'g'));
    if (found.length !== 1) report('og', `${property} présent ${found.length} fois (1 attendue)`);
    else if (property === 'og:url' && attr(found[0], 'content') !== canonicalUrl) {
      report('og', `og:url différent du canonical`);
    }
  }

  const robots = tags(html, /<meta[^>]*\bname="robots"[^>]*>/g);
  const noindex = robots.some((tag) => /noindex/.test(attr(tag, 'content')));
  if (noindex === expected.indexable) {
    report('robots', expected.indexable ? 'noindex sur une page indexable' : 'noindex manquant');
  }

  for (const block of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      JSON.parse(block[1]);
    } catch {
      report('json-ld', 'bloc JSON-LD invalide');
    }
  }

  const h1 = count(html, /<h1[\s>]/g);
  // Pages non indexables (résultats vides en statique) : pas d'obligation de h1.
  if (expected.indexable && h1 !== 1) report('h1', `${h1} balise(s) <h1> (1 attendue)`);

  if (/\bhref="[^"]*onglet=/.test(html)) report('onglet', 'lien interne portant ?onglet=');

  if (expected.content && count(html, /<h2[\s>]/g) === 0) report('h2', 'aucun <h2>');

  return issues;
}
