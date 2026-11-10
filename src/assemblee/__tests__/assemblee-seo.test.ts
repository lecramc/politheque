import {
  buildStaticIndex,
  buildStaticManifest,
} from '@/src/assemblee/gateways/static-assemblee.gateway';
import { groupeFactory, scrutinFactory } from '@/src/assemblee/models/scrutin.factory';
import { assembleeFoldedSnippets } from '@/src/assemblee/models/seo/assemblee-folded-content';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import {
  assembleeListMeta,
  DESCRIPTION_MAX,
  scrutinMeta,
  TITLE_MAX,
} from '@/src/programmes/models/seo/page-meta';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';
import { buildSitemapXml } from '@/src/programmes/models/seo/sitemap';

const index = buildStaticIndex();
const manifest = buildStaticManifest();
const catalog = buildStaticCatalog();

describe('Feature: SEO des pages Assemblée', () => {
  it('should register one indexable URL per published scrutin, dated with its updatedAt', () => {
    const urls = expandRoutes(catalog).filter((u) => u.pattern === '/assemblee/scrutins/[numero]');
    expect(urls).toHaveLength(index.scrutins.length);
    const first = index.scrutins[0];
    expect(urls.find((u) => u.path === `/assemblee/scrutins/${first.numero}`)).toMatchObject({
      indexable: true,
      lastmod: first.updatedAt,
    });
  });

  it('should register the list, dated with the extraction date of the data', () => {
    const list = expandRoutes(catalog).find((u) => u.path === '/assemblee');
    expect(list).toMatchObject({ indexable: true, lastmod: manifest.extraitLe });
  });

  it('should put the list and every scrutin in the sitemap', () => {
    const xml = buildSitemapXml(expandRoutes(catalog));
    expect(xml).toContain('<loc>https://politheque.revaamp.com/assemblee</loc>');
    expect(xml.match(/\/assemblee\/scrutins\//g)).toHaveLength(index.scrutins.length);
  });

  it('should add one Assemblée section to llms.txt, without one line per scrutin', () => {
    const txt = buildLlmsTxt(catalog, expandRoutes(catalog));
    expect(txt).toContain('/assemblee)');
    expect(txt).not.toContain('/assemblee/scrutins/');
  });

  it('should title a scrutin page with its number, long date and a truncated official title', () => {
    const meta = scrutinMeta(
      scrutinFactory({
        numero: 580,
        date: '2025-01-22',
        titre: "l'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
        adopte: true,
        synthese: { ...scrutinFactory().synthese, pour: 446, contre: 2 },
      })
    );
    expect(meta.title.startsWith('Scrutin n° 580 du 22 janvier 2025 : ')).toBe(true);
    expect(meta.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(meta.description).toBe(
      'Scrutin n° 580. Adopté : 446 pour · 2 contre · 1 abstention. Vote de chaque groupe et de chaque député.'
    );
    expect(meta.path).toBe('/assemblee/scrutins/580');
    expect(meta.robots).toBe('index, follow');
  });

  it('should describe a censure motion by its votes for and the required majority, never « contre »', () => {
    const meta = scrutinMeta(
      scrutinFactory({
        type: 'MOC',
        categorie: 'censure',
        adopte: false,
        synthese: { ...scrutinFactory().synthese, pour: 132, contre: 0, requis: 289 },
      })
    );
    expect(meta.description).toContain('Motion rejetée : 132 voix pour, 289 requises');
    expect(meta.description).not.toContain('contre');
  });

  it('should keep every real page title and description within limits', () => {
    for (const scrutin of index.scrutins) {
      const meta = scrutinMeta(scrutin);
      expect(meta.title.length, String(scrutin.numero)).toBeLessThanOrEqual(TITLE_MAX);
      expect(meta.description.length).toBeGreaterThanOrEqual(50);
      expect(meta.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
    const list = assembleeListMeta(index);
    expect(list.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it('should trail the breadcrumb through Comprendre', () => {
    expect(assembleeListMeta(index).breadcrumb.map((b) => b.path)).toEqual([
      '/',
      '/comprendre',
      '/assemblee',
    ]);
    expect(scrutinMeta(scrutinFactory({ numero: 7 })).breadcrumb.at(-1)?.path).toBe(
      '/assemblee/scrutins/7'
    );
  });

  it('should require title, date, result and the first group in the prerendered HTML', () => {
    const scrutin = scrutinFactory({
      numero: 580,
      date: '2025-01-22',
      titre: "l'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
      adopte: true,
      synthese: {
        ...scrutinFactory().synthese,
        pour: 446,
        contre: 2,
        abstentions: 110,
        requis: 225,
      },
      groupes: [[1, 20, 12, 0, 5, 0]],
    });
    const groupes = [
      groupeFactory({ abrev: 'X', libelle: 'Groupe X', medianePlace: 1 }),
      groupeFactory({ abrev: 'LFI-NFP', libelle: 'La France insoumise - NFP', medianePlace: 600 }),
    ];
    const snippets = assembleeFoldedSnippets(scrutin, groupes);
    expect(snippets).toContain(
      "L'ensemble du projet de loi d'urgence pour Mayotte (première lecture)."
    );
    expect(snippets).toContain('22 janvier 2025');
    expect(snippets).toContain(
      'Adopté : 446 pour, 2 contre, 110 abstentions. Majorité requise : 225 voix.'
    );
    expect(snippets).toContain('La France insoumise - NFP');
  });
});
