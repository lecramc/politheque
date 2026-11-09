import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Catalog } from '@/src/programmes/models/programme.model';
import { foldedSnippets } from '@/src/programmes/models/seo/folded-content';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import { buildLlmsFullTxt } from '@/src/programmes/models/seo/llms-full';
import {
  allPageMetas,
  candidatesMeta,
  DESCRIPTION_MAX,
  TITLE_MAX,
} from '@/src/programmes/models/seo/page-meta';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';

const PATH = '/elections/presidentielle-2027/candidats';
const ELECTION = 'presidentielle-2027';
const source = (n: number) => ({
  title: `Source ${n}`,
  url: `https://example.fr/${n}`,
  date: '2026-11-09',
  kind: 'presse' as const,
});

const catalog: Catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'lfi',
      name: 'La France insoumise',
      candidacies: {
        [ELECTION]: {
          candidateName: 'Jean-Luc Mélenchon',
          status: 'declare',
          statusLabel: 'Candidat déclaré',
          candidate: 'A déclaré sa candidature le 3 mai 2026.',
          programmeStatus: '',
          programmeState: 'publie',
          themes: emptyThemes(),
        },
      },
    }),
  ],
  candidates: {
    electionId: ELECTION,
    lastVerified: '2026-11-09',
    candidates: [
      {
        id: 'teddy-riner',
        name: 'Teddy Riner',
        status: 'declare',
        statusLabel: 'Candidature déclarée',
        date: '2026-06',
        affiliation: 'Sans étiquette',
        role: 'Judoka',
        summary: 'Annonce sa candidature.',
        sources: [source(1), source(2)],
      },
    ],
    withdrawn: [
      {
        id: 'x',
        name: 'Xavier Test',
        date: '2026-07-07',
        summary: 'A renoncé à se présenter.',
        sources: [source(3)],
      },
    ],
  },
});

describe('Feature: la page des candidats dans le registre des routes', () => {
  it('should be indexable and dated with the data verification date', () => {
    expect(expandRoutes(catalog).find((u) => u.path === PATH)).toMatchObject({
      indexable: true,
      lastmod: '2026-11-09',
    });
  });
});

describe('Feature: métadonnées de la page des candidats', () => {
  const meta = candidatesMeta(catalog);

  it('should be indexable, within title and description limits, for its own path', () => {
    expect(meta.path).toBe(PATH);
    expect(meta.robots).toBe('index, follow');
    expect(meta.title).toContain("Les candidats à l'élection présidentielle 2027");
    expect(meta.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(meta.description.length).toBeGreaterThanOrEqual(50);
    expect(meta.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(meta.description).not.toContain('candidats déclarés');
    expect(meta.description).toContain('déclarées ou annoncées');
  });

  it('should follow the home, then the election, in the breadcrumb', () => {
    expect(meta.breadcrumb.map((b) => b.path)).toEqual([
      '/',
      '/elections/presidentielle-2027',
      PATH,
    ]);
  });

  it('should describe the list as an ItemList of Person, in alphabetical order', () => {
    const list = meta.jsonLd!['@graph'].find((n) => n['@type'] === 'ItemList') as unknown as {
      itemListElement: { position: number; item: { '@type': string; name: string } }[];
    };
    expect(list.itemListElement.map((e) => [e.position, e.item['@type'], e.item.name])).toEqual([
      [1, 'Person', 'Jean-Luc Mélenchon'],
      [2, 'Person', 'Teddy Riner'],
    ]);
  });

  it('should be returned for its path by allPageMetas', () => {
    expect(allPageMetas(catalog).find((m) => m.path === PATH)?.title).toBe(meta.title);
  });
});

describe('Feature: la page des candidats dans llms.txt et llms-full.txt', () => {
  it('should be linked from llms.txt', () => {
    expect(buildLlmsTxt(catalog, expandRoutes(catalog))).toContain(
      `https://politheque.revaamp.com${PATH}`
    );
  });

  it('should list every candidate with the status and the sources in llms-full.txt', () => {
    const full = buildLlmsFullTxt(catalog);
    expect(full).toContain('Teddy Riner');
    expect(full).toContain('Candidature déclarée (juin 2026)');
    expect(full).toContain('https://example.fr/1');
    expect(full).toContain('Xavier Test');
  });

  it('should require the folded withdrawn section in the exported HTML', () => {
    expect(foldedSnippets(catalog, PATH)).toEqual(['A renoncé à se présenter.']);
  });
});
