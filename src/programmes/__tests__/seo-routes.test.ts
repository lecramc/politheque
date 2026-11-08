import fs from 'node:fs';
import path from 'node:path';

import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import {
  legalDossierFactory,
  legalEntryFactory,
} from '@/src/programmes/models/legal/legal.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { foldedSnippets } from '@/src/programmes/models/seo/folded-content';
import {
  expandRoutes,
  SITE_ROUTES,
  type RoutePattern,
} from '@/src/programmes/models/seo/site-routes';

const APP_DIR = path.resolve(__dirname, '../../../app');

const routeFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? routeFiles(full) : [full];
  });

const patternOf = (file: string) => {
  const relative = path.relative(APP_DIR, file).replace(/\.tsx$/, '');
  const pattern = `/${relative}`.replace(/\/index$/, '') || '/';
  return pattern as RoutePattern;
};

const routeFilesOnly = () =>
  routeFiles(APP_DIR).filter((file) => {
    const name = path.basename(file);
    return !name.startsWith('_layout') && !name.startsWith('+');
  });

const candidacy = {
  candidateName: 'X',
  status: 'declare' as const,
  statusLabel: '',
  candidate: '',
  programmeStatus: '',
  programmeState: 'non-publie' as const,
  themes: {} as never,
};
const history = { founded: '', origins: { text: '', sources: [] }, ideals: [], timeline: [] };

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'zeta',
      name: 'Zeta',
      lastVerified: '2026-10-01',
      history,
      candidacies: { 'presidentielle-2027': candidacy },
    }),
    partyFactory({
      id: 'alpha',
      name: 'Alpha',
      lastVerified: '2026-11-03',
      history,
      candidacies: { 'presidentielle-2027': candidacy },
    }),
  ],
  elections: [electionFactory()],
});

const find = (urls: ReturnType<typeof expandRoutes>, p: string) => urls.find((u) => u.path === p);

describe('Feature: registre des routes', () => {
  it('should declare every route file of app/ in the registry', () => {
    for (const file of routeFilesOnly()) {
      expect(Object.keys(SITE_ROUTES), file).toContain(patternOf(file));
    }
  });

  it('should have a route file for every registry pattern', () => {
    const patterns = routeFilesOnly().map(patternOf);
    for (const pattern of Object.keys(SITE_ROUTES)) expect(patterns).toContain(pattern);
  });

  it('should call staticParamsFor with its own pattern in every dynamic route file', () => {
    // Expo expanse un segment dynamique depuis le fichier qui le porte : `[id].tsx`, ou le
    // `_layout.tsx` d'un dossier `[id]/` (les feuilles d'un tel dossier n'ont pas de params propres).
    const dynamicFiles = routeFiles(APP_DIR).filter((file) => {
      const name = path.basename(file);
      return (
        name.startsWith('[') ||
        (name === '_layout.tsx' && path.basename(path.dirname(file)).startsWith('['))
      );
    });
    expect(dynamicFiles.length).toBeGreaterThan(0);
    for (const file of dynamicFiles) {
      const isLayout = path.basename(file) === '_layout.tsx';
      const pattern = isLayout ? patternOf(path.dirname(file) + '.tsx') : patternOf(file);
      expect(fs.readFileSync(file, 'utf8'), file).toContain(`staticParamsFor('${pattern}')`);
    }
  });

  it('should expand one URL per party for each of the four party sections', () => {
    const urls = expandRoutes(catalog).map((u) => u.path);
    for (const id of ['alpha', 'zeta']) {
      expect(urls).toContain(`/partis/${id}`);
      expect(urls).toContain(`/partis/${id}/histoire`);
      expect(urls).toContain(`/partis/${id}/positions`);
      expect(urls).toContain(`/partis/${id}/programme-2027`);
    }
  });

  it('should list parties in alphabetical order (fr) in expanded URLs', () => {
    const urls = expandRoutes(catalog)
      .map((u) => u.path)
      .filter((p) => /^\/partis\/[^/]+$/.test(p) && p !== '/partis/comparer');
    expect(urls).toEqual(['/partis/alpha', '/partis/zeta']);
  });

  it('should mark passeport, quiz results and the bare party alias as not indexable', () => {
    const urls = expandRoutes(catalog);
    expect(find(urls, '/passeport')?.indexable).toBe(false);
    expect(find(urls, '/me-situer/resultats')?.indexable).toBe(false);
    expect(find(urls, '/partis/alpha')?.indexable).toBe(false);
    expect(find(urls, '/partis/alpha/programme-2027')?.indexable).toBe(true);
    expect(find(urls, '/me-situer')?.indexable).toBe(true);
  });

  it('should point the bare party alias to the programme tab as its canonical', () => {
    const alias = find(expandRoutes(catalog), '/partis/alpha');
    expect(alias?.canonicalPath).toBe('/partis/alpha/programme-2027');
    expect(
      find(expandRoutes(catalog), '/partis/alpha/programme-2027')?.canonicalPath
    ).toBeUndefined();
  });

  it('should keep the thin compare tool out of the index, and drop the retired hubs', () => {
    const urls = expandRoutes(catalog).map((u) => u.path);
    expect(find(expandRoutes(catalog), '/partis/comparer')?.indexable).toBe(false);
    expect(urls).not.toContain('/debats');
    expect(urls).not.toContain('/elections');
    expect(urls.some((p) => p.startsWith('/parcours'))).toBe(false);
  });

  it('should date a party page with the party lastVerified', () => {
    const urls = expandRoutes(catalog);
    expect(find(urls, '/partis/zeta/histoire')?.lastmod).toBe('2026-10-01');
    expect(find(urls, '/partis')?.lastmod).toBe('2026-11-03');
  });

  it('should date a debate page with the latest party date when the theme has none', () => {
    expect(find(expandRoutes(catalog), '/debats/economie')?.lastmod).toBe('2026-11-03');
  });

  it('should not date a page without a real verification date', () => {
    const urls = expandRoutes(catalog);
    expect(find(urls, '/methodologie')?.lastmod).toBeNull();
    expect(find(urls, '/comprendre/institutions')?.lastmod).toBeNull();
  });

  it('should use a real guide verification date when one exists', () => {
    const dated = catalogFactory({
      guide: [
        {
          id: 'institutions',
          title: 'I',
          icon: '',
          summary: '',
          blocks: [],
          lastVerified: '2026-09-09',
        },
      ],
    });
    expect(find(expandRoutes(dated), '/comprendre/institutions')?.lastmod).toBe('2026-09-09');
  });

  it('should expand every real route file with the real catalog', () => {
    const urls = expandRoutes(buildStaticCatalog());
    expect(urls.length).toBeGreaterThan(40);
    expect(new Set(urls.map((u) => u.path)).size).toBe(urls.length);
  });

  it('should list /corrections as indexable, dated with the latest correction', () => {
    const none = find(expandRoutes(catalog), '/corrections');
    expect(none).toMatchObject({ indexable: true, lastmod: null });
    const dated = catalogFactory({
      corrections: [
        { id: 'b', date: '2026-11-09', kind: 'ajout', pages: ['/partis'], summary: '' },
        { id: 'a', date: '2026-11-03', kind: 'ajout', pages: ['/partis'], summary: '' },
      ],
    });
    expect(find(expandRoutes(dated), '/corrections')?.lastmod).toBe('2026-11-09');
  });

  it('should expand procedures pages in the registry only when dossiers are published', () => {
    const paths = (c: typeof catalog) => expandRoutes(c).map((u) => u.path);
    expect(paths(catalog).some((p) => p.endsWith('/procedures-judiciaires'))).toBe(false);
    const published = {
      ...catalog,
      legal: catalog.parties.map((p) => legalDossierFactory({ partyId: p.id })),
    };
    expect(paths(published).filter((p) => p.endsWith('/procedures-judiciaires'))).toEqual([
      '/partis/alpha/procedures-judiciaires',
      '/partis/zeta/procedures-judiciaires',
    ]);
  });

  it('should date a procedures page with its latest dossier date', () => {
    const published = {
      ...catalog,
      legal: [
        legalDossierFactory({
          partyId: 'alpha',
          reviewedOn: '2026-11-02',
          entries: [legalEntryFactory({ lastVerified: '2026-11-04' })],
        }),
        legalDossierFactory({ partyId: 'zeta', reviewedOn: '2026-10-20', entries: [] }),
      ],
    };
    const urls = expandRoutes(published);
    expect(find(urls, '/partis/alpha/procedures-judiciaires')?.lastmod).toBe('2026-11-04');
    expect(find(urls, '/partis/zeta/procedures-judiciaires')?.lastmod).toBe('2026-10-20');
    expect(find(urls, '/partis/zeta/histoire')?.lastmod).toBe('2026-10-01');
  });
});

describe('Feature: contenu replié attendu dans le HTML', () => {
  const catalog = buildStaticCatalog();

  it('should expect one folded fragment on guide, debate and programme pages', () => {
    for (const path of [
      '/comprendre/comment-voter',
      '/debats/economie',
      '/partis/rn/programme-2027',
    ]) {
      expect(foldedSnippets(catalog, path)).toHaveLength(1);
    }
  });

  it('should expect nothing on pages without folded content', () => {
    expect(foldedSnippets(catalog, '/partis')).toEqual([]);
  });
});
