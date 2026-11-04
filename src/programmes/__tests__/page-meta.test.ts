import { APP_NAME } from '@/src/core/config/app';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import {
  brandTitle,
  clampText,
  debateMeta,
  electionMeta,
  guideSectionMeta,
  homeMeta,
  nonIndexableMeta,
  partyLabel,
  partyPageContext,
  partySectionMeta,
  quizMeta,
  rubricMeta,
} from '@/src/programmes/models/seo/page-meta';

const candidacy = {
  candidateName: 'Jeanne Dupont',
  status: 'declare' as const,
  statusLabel: 'Candidate déclarée',
  candidate: '',
  programmeStatus: '',
  themes: {} as never,
};
const history = { founded: '', origins: { text: '', sources: [] }, ideals: [], timeline: [] };

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'alpha',
      name: 'Alpha',
      shortName: 'ABC',
      history,
      lastVerified: '2026-11-03',
      candidacies: { 'presidentielle-2027': candidacy },
    }),
    partyFactory({
      id: 'parti-socialiste-place-publique-avec-un-nom-tres-long',
      name: 'Parti socialiste – Place publique avec un nom très long',
      shortName: 'PS-PP',
      history,
      lastVerified: '2026-11-03',
      candidacies: { 'presidentielle-2027': candidacy },
    }),
  ],
});
const alpha = catalog.parties[0];

describe('Feature: textes de métadonnées', () => {
  it('should append the brand to a title', () => {
    expect(brandTitle('Partis')).toBe(`Partis · ${APP_NAME}`);
  });

  it('should clamp a description at a word boundary with an ellipsis', () => {
    expect(clampText('un deux trois quatre cinq', 14)).toBe('un deux trois…');
  });

  it('should leave a short description untouched', () => {
    expect(clampText('court', 160)).toBe('court');
  });

  it('should label a party as "Name (ABBR)" and avoid repeating an abbreviation contained in the name', () => {
    expect(partyLabel({ name: 'Rassemblement national', shortName: 'RN' })).toBe(
      'Rassemblement national (RN)'
    );
    expect(partyLabel({ name: 'Horizons', shortName: 'Horizons' })).toBe('Horizons');
    expect(partyLabel({ name: 'Les Écologistes', shortName: 'Écologistes' })).toBe(
      'Les Écologistes'
    );
  });
});

describe('Feature: métadonnées des pages', () => {
  it('should describe the home page with the fixed site description', () => {
    const meta = homeMeta(catalog);
    expect(meta.title).toBe('Travée · Comprendre la politique française et la présidentielle 2027');
    expect(meta.path).toBe('/');
    expect(meta.breadcrumb).toEqual([]);
  });

  it('should build each party section title from the same template', () => {
    const ctx = partyPageContext(alpha, catalog);
    expect(partySectionMeta(ctx, 'en-bref').title).toBe(
      'Alpha (ABC) : histoire, idées et positions · Travée'
    );
    expect(partySectionMeta(ctx, 'histoire').title).toBe(
      'Alpha (ABC) : histoire, fondateurs et dates clés · Travée'
    );
    expect(partySectionMeta(ctx, 'positions').title).toBe(
      'Alpha (ABC) : positions sur 3 questions · Travée'
    );
    expect(partySectionMeta(ctx, 'programme-2027').title).toBe(
      'Alpha (ABC) : propositions pour la présidentielle 2027 · Travée'
    );
  });

  it('should fall back to the short name when the full label makes the title too long', () => {
    const long = catalog.parties[1];
    expect(partySectionMeta(partyPageContext(long, catalog), 'programme-2027').title).toBe(
      'PS-PP : propositions pour la présidentielle 2027 · Travée'
    );
  });

  it('should mention the verification date in every party description', () => {
    const ctx = partyPageContext(alpha, catalog);
    for (const section of ['en-bref', 'histoire', 'positions', 'programme-2027'] as const) {
      expect(partySectionMeta(ctx, section).description).toContain(
        'Fiche vérifiée le 3 novembre 2026'
      );
    }
  });

  it('should state the candidate name and its status label on the 2027 page', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'programme-2027');
    expect(meta.description).toContain('Jeanne Dupont (Candidate déclarée)');
  });

  it('should not mention any party family in a party description', () => {
    const party = { ...alpha, family: 'Extrême droite (qualification)' };
    const meta = partySectionMeta(partyPageContext(party, catalog), 'en-bref');
    expect(meta.description).not.toContain('Extrême');
  });

  it('should not mention any round date in the election description', () => {
    const meta = electionMeta(catalog.elections[0], catalog);
    expect(meta.description).not.toMatch(/\d{4}/);
  });

  it('should use the guide summary as guide description, clamped to 160', () => {
    const summary = 'mot '.repeat(60).trim();
    const meta = guideSectionMeta({ ...catalog.guide[0], summary });
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.description.endsWith('…')).toBe(true);
  });

  it('should give canonical paths without query nor trailing slash', () => {
    const metas = [
      rubricMeta('partis', catalog),
      guideSectionMeta(catalog.guide[0]),
      debateMeta(catalog.themes[0], catalog),
      quizMeta(30),
      partySectionMeta(partyPageContext(alpha, catalog), 'histoire'),
    ];
    for (const meta of metas) expect(meta.path).toMatch(/^\/[^?]*[^/]$/);
  });

  it('should build breadcrumbs from the home page down to the page', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'histoire');
    expect(meta.breadcrumb.map((c) => c.name)).toEqual(['Accueil', 'Partis', 'Alpha', 'Histoire']);
    expect(meta.breadcrumb.at(-1)?.path).toBe('/partis/alpha/histoire');
  });

  it('should mark non-indexable pages as "noindex, follow" without JSON-LD', () => {
    const meta = nonIndexableMeta('Mon passeport', '/passeport');
    expect(meta.robots).toBe('noindex, follow');
    expect(meta.jsonLd).toBeNull();
  });

  it('should emit no Event for an election whose dates are provisional', () => {
    const meta = electionMeta(catalog.elections[0], catalog);
    expect(JSON.stringify(meta.jsonLd)).not.toContain('"Event"');
  });

  it('should list the parties mentioned on a debate page in alphabetical order', () => {
    const meta = debateMeta(catalog.themes[0], catalog);
    const article = meta.jsonLd!['@graph'].find((n) => n['@type'] === 'Article') as unknown as {
      mentions: { name: string }[];
    };
    expect(article.mentions.map((m) => m.name)).toEqual([
      'Alpha',
      'Parti socialiste – Place publique avec un nom très long',
    ]);
  });

  it('should describe the 2027 candidate as a Person without memberOf', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'programme-2027');
    const json = JSON.stringify(meta.jsonLd);
    expect(json).toContain('"Person"');
    expect(json).not.toContain('memberOf');
  });

  it('should date a party page with the party lastVerified', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'positions');
    expect(JSON.stringify(meta.jsonLd)).toContain('"dateModified":"2026-11-03"');
  });

  it('should omit datePublished everywhere', () => {
    const metas = [
      homeMeta(catalog),
      rubricMeta('debats', catalog),
      debateMeta(catalog.themes[0], catalog),
      partySectionMeta(partyPageContext(alpha, catalog), 'en-bref'),
    ];
    for (const meta of metas)
      expect(JSON.stringify(meta.jsonLd)).not.toContain('"datePublished":"2026-11-03"');
    // Seules les citations portent la date de leur source ; jamais le nœud Article.
    const article = (metas[3].jsonLd!['@graph'].find((n) => n['@type'] === 'Article') ??
      {}) as object;
    expect(article).not.toHaveProperty('datePublished');
  });

  it('should include a minimal publisher Organization node on every indexable page except home', () => {
    const meta = rubricMeta('elections', catalog);
    const org = meta.jsonLd!['@graph'].find((n) => n['@type'] === 'Organization')!;
    expect(org).not.toHaveProperty('logo');
    const home = homeMeta(catalog).jsonLd!['@graph'];
    expect(home.find((n) => n['@type'] === 'WebSite')).toBeDefined();
  });
});
