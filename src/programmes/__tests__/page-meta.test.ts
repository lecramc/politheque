import { APP_NAME } from '@/src/core/config/app';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import {
  legalDossierFactory,
  legalEntryFactory,
} from '@/src/programmes/models/legal/legal.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import {
  brandTitle,
  clampText,
  correctionsMeta,
  debateMeta,
  electionMeta,
  guideSectionMeta,
  homeMeta,
  nonIndexableMeta,
  partyLabel,
  partyPageContext,
  partyAliasMeta,
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
  programmeState: 'partiel' as const,
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
    expect(meta.title).toBe('Polithèque · Comprendre la politique française, présidentielle 2027');
    expect(meta.path).toBe('/');
    expect(meta.breadcrumb).toEqual([]);
  });

  it('should build each party section title from the same template', () => {
    const ctx = partyPageContext(alpha, catalog);
    expect(partySectionMeta(ctx, 'programme').title).toBe(
      'Alpha (ABC) : programme 2027 · Polithèque'
    );
    expect(partySectionMeta(ctx, 'histoire').title).toBe(
      'Alpha (ABC) : histoire, fondateurs et dates clés · Polithèque'
    );
    expect(partySectionMeta(ctx, 'positions').title).toBe(
      'Alpha (ABC) : positions sur 3 questions · Polithèque'
    );
  });

  it('should never reduce the programme title to the acronym alone, even when the name is long', () => {
    const long = catalog.parties[1];
    const title = partySectionMeta(partyPageContext(long, catalog), 'programme').title;
    expect(title).toContain(long.name);
    expect(title).toContain(': programme 2027');
    expect(title.startsWith('PS-PP')).toBe(false);
  });

  it('should fall back to the short name for the other sections when the label is too long', () => {
    const long = catalog.parties[1];
    expect(partySectionMeta(partyPageContext(long, catalog), 'positions').title).toBe(
      'PS-PP : positions sur 3 questions · Polithèque'
    );
  });

  it('should mention the verification date in every party description', () => {
    const ctx = partyPageContext(alpha, catalog);
    for (const section of ['programme', 'histoire', 'positions'] as const) {
      expect(partySectionMeta(ctx, section).description).toContain(
        'Fiche vérifiée le 3 novembre 2026'
      );
    }
  });

  it('should open the programme description with the name, without any article', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'programme');
    expect(meta.description).toMatch(
      /^Alpha \(ABC\) : programme 2027 en \d+ thèmes?, avec ses sources\./
    );
  });

  it('should keep the bare party address as a canonical-only alias, never noindex and canonical together', () => {
    const meta = partyAliasMeta(partyPageContext(alpha, catalog));
    expect(meta.path).toBe('/partis/alpha/programme-2027');
    expect(meta.robots).toBe('index, follow');
    expect(meta.jsonLd).toBeNull();
  });

  it('should state the candidate name and its status label on the 2027 page', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'programme');
    expect(meta.description).toContain('Jeanne Dupont (Candidate déclarée)');
  });

  it('should not mention any party family in a party description', () => {
    const party = { ...alpha, family: 'Extrême droite (qualification)' };
    const meta = partySectionMeta(partyPageContext(party, catalog), 'programme');
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
    const meta = nonIndexableMeta('Ma progression', '/passeport');
    expect(meta.robots).toBe('noindex, follow');
    expect(meta.jsonLd).toBeNull();
  });

  it('should emit one Event per round with its official date', () => {
    const election = electionFactory({
      rounds: [
        { label: '1er tour', date: '2027-04-18', sources: [] },
        { label: '2nd tour', date: '2027-05-02', sources: [] },
      ],
    });
    const events = electionMeta(election, catalog).jsonLd!['@graph'].filter(
      (n) => n['@type'] === 'Event'
    ) as unknown as { name: string; startDate: string }[];
    expect(events.map((e) => e.startDate)).toEqual(['2027-04-18', '2027-05-02']);
    expect(events[0].name).toBe('Élection présidentielle 2027 : 1er tour');
  });

  it('should emit no Event for a round whose date is provisional', () => {
    const election = electionFactory({
      rounds: [{ label: '2nd tour (date calculée, à confirmer)', date: '2027-05-02', sources: [] }],
    });
    expect(JSON.stringify(electionMeta(election, catalog).jsonLd)).not.toContain('"Event"');
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
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'programme');
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
      rubricMeta('partis', catalog),
      debateMeta(catalog.themes[0], catalog),
      partySectionMeta(partyPageContext(alpha, catalog), 'programme'),
    ];
    for (const meta of metas)
      expect(JSON.stringify(meta.jsonLd)).not.toContain('"datePublished":"2026-11-03"');
    // Seules les citations portent la date de leur source ; jamais le nœud Article.
    const article = (metas[3].jsonLd!['@graph'].find((n) => n['@type'] === 'Article') ??
      {}) as object;
    expect(article).not.toHaveProperty('datePublished');
  });

  it('should include a minimal publisher Organization node on every indexable page except home', () => {
    const meta = rubricMeta('comprendre', catalog);
    const org = meta.jsonLd!['@graph'].find((n) => n['@type'] === 'Organization')!;
    expect(org).not.toHaveProperty('logo');
    const home = homeMeta(catalog).jsonLd!['@graph'];
    expect(home.find((n) => n['@type'] === 'WebSite')).toBeDefined();
  });
});

describe('Feature: métadonnées du journal des corrections', () => {
  it('should describe the journal as an indexable collection page with a fixed description', () => {
    const meta = correctionsMeta();
    expect(meta.path).toBe('/corrections');
    expect(meta.title).toBe(brandTitle('Journal des corrections'));
    expect(meta.robots).toBe('index, follow');
    expect(meta.description.length).toBeGreaterThanOrEqual(50);
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.breadcrumb.map((c) => c.name)).toEqual(['Accueil', 'Corrections']);
    const types = meta.jsonLd!['@graph'].map((n) => n['@type']);
    expect(types).toContain('CollectionPage');
    expect(types).toContain('BreadcrumbList');
  });
});

describe('Feature: métadonnées de la section procédures', () => {
  const published = catalogFactory({
    parties: catalog.parties,
    legal: catalog.parties.map((p) =>
      legalDossierFactory({
        partyId: p.id,
        reviewedOn: '2026-11-03',
        entries: [
          legalEntryFactory({
            person: { name: 'Jean Dupont', sortName: 'Dupont Jean', kind: 'personne-physique' },
            lastVerified: '2026-11-04',
          }),
        ],
      })
    ),
  });
  const procedures = (index: number) =>
    partySectionMeta(partyPageContext(published.parties[index], published), 'procedures');

  it('should build the procedures title and description from the same template for every party', () => {
    expect(procedures(0).title).toBe('Alpha (ABC) : procédures judiciaires · Polithèque');
    expect(procedures(0).description).toBe(
      'Procédures judiciaires concernant Alpha (ABC), ses dirigeants, candidats et élus nationaux : statut exact, décisions, sources. Arrêté au 3 novembre 2026.'
    );
    expect(procedures(0).path).toBe('/partis/alpha/procedures-judiciaires');
    // Même règle de repli que les autres sections quand le nom complet est trop long.
    expect(procedures(1).title).toBe('PS-PP : procédures judiciaires · Polithèque');
    expect(procedures(1).description.length).toBeLessThanOrEqual(160);
    expect(procedures(1).description).toContain('concernant PS-PP,');
    for (const index of [0, 1]) {
      expect(procedures(index).description.length).toBeLessThanOrEqual(160);
      expect(procedures(index).description.length).toBeGreaterThanOrEqual(50);
    }
  });

  it('should never include a person name in procedures title, description, breadcrumb or JSON-LD', () => {
    for (const index of [0, 1]) {
      const meta = procedures(index);
      expect(JSON.stringify(meta)).not.toMatch(/Dupont|Jean/);
    }
  });

  it('should describe the procedures page with PoliticalParty only and citations named by domain', () => {
    const graph = procedures(0).jsonLd!['@graph'];
    const article = graph.find((n) => n['@type'] === 'Article') as unknown as {
      about: { '@type': string }[];
      dateModified: string;
      citation: { name: string }[];
      mentions?: unknown;
    };
    expect(article.about.map((n) => n['@type'])).toEqual(['PoliticalParty']);
    expect(article.mentions).toBeUndefined();
    expect(article.dateModified).toBe('2026-11-04');
    expect(article.citation.map((c) => c.name).sort()).toEqual([
      'courdecassation.fr',
      'lemonde.fr',
    ]);
    expect(JSON.stringify(graph)).not.toContain('"Person"');
    expect(procedures(0).breadcrumb.map((c) => c.name)).toEqual([
      'Accueil',
      'Partis',
      'Alpha',
      'Procédures judiciaires',
    ]);
  });

  it('should not index the procedures page of a party without published dossier', () => {
    const meta = partySectionMeta(partyPageContext(alpha, catalog), 'procedures');
    expect(meta.robots).toBe('noindex, follow');
    expect(meta.jsonLd).toBeNull();
  });
});
