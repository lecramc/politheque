import fs from 'node:fs';
import path from 'node:path';

import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
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
      .filter((p) => /^\/partis\/[^/]+$/.test(p));
    expect(urls).toEqual(['/partis/alpha', '/partis/zeta']);
  });

  it('should mark passeport, quiz results and journey steps as not indexable', () => {
    const urls = expandRoutes(catalog);
    expect(find(urls, '/passeport')?.indexable).toBe(false);
    expect(find(urls, '/me-situer/resultats')?.indexable).toBe(false);
    expect(find(urls, '/parcours/les-bases')?.indexable).toBe(false);
    expect(find(urls, '/me-situer')?.indexable).toBe(true);
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
});
