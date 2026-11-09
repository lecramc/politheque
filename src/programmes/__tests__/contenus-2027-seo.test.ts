import { SITE_URL } from '@/src/core/config/app';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { foldedSnippets } from '@/src/programmes/models/seo/folded-content';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import { buildLlmsFullTxt } from '@/src/programmes/models/seo/llms-full';
import {
  allPageMetas,
  DESCRIPTION_MAX,
  faqMeta,
  lexiconMeta,
  TITLE_MAX,
  voterMeta,
} from '@/src/programmes/models/seo/page-meta';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';

const catalog = buildStaticCatalog();
const urls = expandRoutes(catalog);
const LEXICON = '/comprendre/lexique';
const FAQ = '/elections/presidentielle-2027/questions';
const VOTER = '/elections/presidentielle-2027/voter';

const graphOf = (meta: { jsonLd: { '@graph': { '@type': unknown }[] } | null }) =>
  meta.jsonLd!['@graph'];
const typesOf = (meta: Parameters<typeof graphOf>[0]) => graphOf(meta).map((n) => n['@type']);

describe('Feature: contenus 2027 dans le registre des routes', () => {
  it('should list the lexicon, the FAQ and the voting page as indexable, dated with the latest verification', () => {
    for (const path of [LEXICON, FAQ, VOTER]) {
      const url = urls.find((u) => u.path === path);
      expect(url, path).toMatchObject({ indexable: true, lastmod: '2026-11-08' });
    }
  });

  it('should keep the lexicon route distinct from the guide lessons', () => {
    const guidePaths = urls.filter((u) => u.pattern === '/comprendre/[id]').map((u) => u.path);
    expect(guidePaths).not.toContain(LEXICON);
  });

  it('should not turn the lexicon route into a guide lesson static param', () => {
    expect(catalog.guide.map((s) => s.id)).not.toContain('lexique');
  });
});

describe('Feature: métadonnées des contenus 2027', () => {
  const metas = [
    ['lexique', lexiconMeta(catalog), LEXICON],
    ['faq', faqMeta(catalog), FAQ],
    ['voter', voterMeta(catalog), VOTER],
  ] as const;

  it('should state the counts in the titles', () => {
    expect(lexiconMeta(catalog).title).toContain(`${catalog.lexicon.length} mots expliqués`);
    expect(faqMeta(catalog).title).toContain(`${catalog.faq.length} questions-réponses`);
    expect(voterMeta(catalog).title).toContain('Comment voter');
  });

  it('should stay within title and description limits and be indexable', () => {
    for (const [name, meta, path] of metas) {
      expect(meta.path, name).toBe(path);
      expect(meta.robots, name).toBe('index, follow');
      expect(meta.title.length, name).toBeLessThanOrEqual(TITLE_MAX);
      expect(meta.description.length, name).toBeGreaterThanOrEqual(50);
      expect(meta.description.length, name).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it('should be returned for their path by allPageMetas', () => {
    const all = allPageMetas(catalog);
    for (const [, meta, path] of metas) {
      expect(all.find((m) => m.path === path)?.title).toBe(meta.title);
    }
  });

  it('should build the breadcrumbs from the home page', () => {
    expect(lexiconMeta(catalog).breadcrumb.map((b) => b.path)).toEqual([
      '/',
      '/comprendre',
      LEXICON,
    ]);
    expect(faqMeta(catalog).breadcrumb.map((b) => b.path)).toEqual([
      '/',
      '/elections/presidentielle-2027',
      FAQ,
    ]);
    expect(voterMeta(catalog).breadcrumb.map((b) => b.path)).toEqual([
      '/',
      '/elections/presidentielle-2027',
      VOTER,
    ]);
  });

  it('should describe the lexicon as a DefinedTermSet with one DefinedTerm per entry', () => {
    const meta = lexiconMeta(catalog);
    expect(typesOf(meta)).toContain('DefinedTermSet');
    const terms = graphOf(meta).filter((n) => n['@type'] === 'DefinedTerm') as unknown as {
      name: string;
      url: string;
    }[];
    expect(terms).toHaveLength(catalog.lexicon.length);
    expect(terms[0].url).toBe(`${SITE_URL}${LEXICON}#${catalog.lexicon[0].id}`);
    expect(terms.map((t) => t.name)).toEqual(catalog.lexicon.map((t) => t.term));
  });

  it('should describe the FAQ as a FAQPage with every question and its short answer', () => {
    const page = graphOf(faqMeta(catalog)).find((n) => n['@type'] === 'FAQPage') as unknown as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(page.mainEntity.map((q) => q.name)).toEqual(catalog.faq.map((q) => q.question));
    expect(page.mainEntity[0].acceptedAnswer.text).toBe(catalog.faq[0].answer);
  });

  it('should cite the voting page sources and carry no Event for a calculated date', () => {
    const meta = voterMeta(catalog);
    expect(typesOf(meta)).toContain('Article');
    expect(typesOf(meta)).not.toContain('Event');
    expect(JSON.stringify(meta.jsonLd)).toContain('service-public.gouv.fr');
  });

  it('should keep the JSON-LD under 60 KB', () => {
    for (const [name, meta] of metas) {
      expect(JSON.stringify(meta.jsonLd).length, name).toBeLessThan(60 * 1024);
    }
  });
});

describe('Feature: neutralité des contenus 2027', () => {
  const names = catalog.parties
    .flatMap((p) => [p.name, p.shortName])
    .filter((name) => name.length > 2);
  const shortNames = catalog.parties.map((p) => p.shortName).filter((n) => n.length <= 3);

  const texts = () => [
    JSON.stringify(catalog.lexicon),
    JSON.stringify(catalog.faq),
    JSON.stringify(catalog.voter),
    JSON.stringify([lexiconMeta(catalog), faqMeta(catalog), voterMeta(catalog)]),
  ];

  it('should name no party in the lexicon, the FAQ, the voting page and their metadata', () => {
    for (const text of texts()) {
      for (const name of names) expect(text, name).not.toContain(name);
      for (const short of shortNames) {
        expect(text, short).not.toMatch(new RegExp(`(^|[^\\p{L}])${short}([^\\p{L}]|$)`, 'u'));
      }
    }
  });
});

describe('Feature: contenus 2027 pour les moteurs de réponse', () => {
  it('should list the three pages in llms.txt', () => {
    const llms = buildLlmsTxt(catalog, urls);
    for (const path of [LEXICON, FAQ, VOTER]) expect(llms).toContain(`(${SITE_URL}${path})`);
  });

  it('should publish the lexicon, the FAQ and the voting guide with their sources in llms-full.txt', () => {
    const full = buildLlmsFullTxt(catalog);
    expect(full).toContain(`Page : ${SITE_URL}${LEXICON}`);
    expect(full).toContain(catalog.lexicon[0].definition);
    expect(full).toContain(`Page : ${SITE_URL}${FAQ}`);
    expect(full).toContain(catalog.faq[0].answer);
    expect(full).toContain(`Page : ${SITE_URL}${VOTER}`);
    expect(full).toContain(catalog.voter.sections[0].title);
  });

  it('should mark calculated dates as such in llms-full.txt', () => {
    const full = buildLlmsFullTxt(catalog);
    expect(full).toContain('Date calculée');
    expect(full).toContain(catalog.faq.find((q) => q.calculated)!.calculated![0].rule);
  });

  it('should expect one folded fragment on each of the three pages', () => {
    for (const path of [LEXICON, FAQ, VOTER]) {
      expect(foldedSnippets(catalog, path), path).toHaveLength(1);
    }
  });
});
