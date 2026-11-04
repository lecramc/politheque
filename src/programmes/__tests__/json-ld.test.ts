import { APP_NAME, SITE_URL } from '@/src/core/config/app';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Source } from '@/src/programmes/models/programme.model';
import {
  articleNode,
  breadcrumbNode,
  citationNodes,
  graph,
  ORGANIZATION_ID,
  organizationNode,
  personNode,
  politicalPartyNode,
  serializeJsonLd,
  websiteNode,
} from '@/src/programmes/models/seo/json-ld';

const source = (url: string, date = '2026-01-01'): Source => ({
  title: `Source ${url}`,
  url,
  date,
  kind: 'presse',
});

describe('Feature: données structurées', () => {
  it('should describe the site with a full Organization and a WebSite', () => {
    const org = organizationNode(true);
    expect(org).toMatchObject({ '@type': 'Organization', '@id': ORGANIZATION_ID, name: APP_NAME });
    expect(websiteNode()).toMatchObject({
      '@type': 'WebSite',
      publisher: { '@id': ORGANIZATION_ID },
    });
  });

  it('should point publishingPrinciples to /methodologie and correctionsPolicy to /corrections', () => {
    expect(organizationNode(true)).toMatchObject({
      publishingPrinciples: `${SITE_URL}/methodologie`,
      correctionsPolicy: `${SITE_URL}/corrections`,
    });
  });

  it('should keep the minimal publisher Organization node light', () => {
    expect(Object.keys(organizationNode(false)).sort()).toEqual(
      ['@id', '@type', 'name', 'url'].sort()
    );
  });

  it('should number breadcrumb items from 1 with absolute URLs', () => {
    const node = breadcrumbNode([
      { name: 'Accueil', path: '/' },
      { name: 'Partis', path: '/partis' },
    ]) as unknown as { itemListElement: { position: number; item: string }[] };
    expect(node.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(node.itemListElement[1].item).toBe(`${SITE_URL}/partis`);
  });

  it('should describe a party with PoliticalParty, name and alternate short name only', () => {
    const node = politicalPartyNode(
      partyFactory({ id: 'rn', name: 'Rassemblement national', shortName: 'RN' })
    );
    expect(node).toEqual({
      '@type': 'PoliticalParty',
      '@id': `${SITE_URL}/partis/rn#parti`,
      name: 'Rassemblement national',
      alternateName: 'RN',
      url: `${SITE_URL}/partis/rn`,
    });
    expect(
      politicalPartyNode(partyFactory({ name: 'Horizons', shortName: 'Horizons' }))
    ).not.toHaveProperty('alternateName');
  });

  it('should describe a person with a name and no memberOf', () => {
    expect(personNode('Jeanne Dupont')).toEqual({ '@type': 'Person', name: 'Jeanne Dupont' });
  });

  it('should list unique sources as citations with their dates', () => {
    const nodes = citationNodes([
      source('https://a.fr'),
      source('https://a.fr'),
      source('https://b.fr', '2025-05'),
    ]);
    expect(nodes).toHaveLength(2);
    expect(nodes[1]).toMatchObject({
      '@type': 'CreativeWork',
      url: 'https://b.fr',
      datePublished: '2025-05',
    });
  });

  it('should build an article with dateModified, citations and no datePublished', () => {
    const node = articleNode({
      path: '/partis/rn',
      headline: 'RN',
      description: 'Desc',
      dateModified: '2026-11-03',
      sources: [source('https://a.fr')],
    });
    expect(node).toMatchObject({
      '@type': 'Article',
      mainEntityOfPage: `${SITE_URL}/partis/rn`,
      dateModified: '2026-11-03',
      author: { '@id': ORGANIZATION_ID },
    });
    expect(node).not.toHaveProperty('datePublished');
    expect(
      articleNode({ path: '/x', headline: 'h', description: 'd', dateModified: null, sources: [] })
    ).not.toHaveProperty('dateModified');
  });

  it('should escape <, >, & and line separators when serializing', () => {
    const json = serializeJsonLd(graph({ '@type': 'Thing', name: '</script><b>&\u2028x' }));
    expect(json).not.toMatch(/[<>&\u2028]/);
    expect(json).toContain('\\u003c/script\\u003e');
  });

  it('should round-trip through JSON.parse after serialization', () => {
    const g = graph({ '@type': 'Thing', name: 'a < b & c > d' });
    expect(JSON.parse(serializeJsonLd(g))).toEqual(g);
  });
});
