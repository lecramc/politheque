import { APP_NAME, SITE_LANG, SITE_URL } from '@/src/core/config/app';
import type { Party, Source } from '@/src/programmes/models/programme.model';
import { partyHref } from '@/src/programmes/models/seo/party-sections';
import { absoluteUrl } from '@/src/programmes/models/seo/site-routes';

export type JsonLdNode = { '@type': string | string[]; '@id'?: string; [key: string]: unknown };
export type JsonLdGraph = { '@context': 'https://schema.org'; '@graph': JsonLdNode[] };

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const OG_IMAGE_URL = `${SITE_URL}/og.png`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;

const METHODOLOGY_URL = `${SITE_URL}/methodologie`;

export function organizationNode(full: boolean): JsonLdNode {
  const base: JsonLdNode = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: APP_NAME,
    url: `${SITE_URL}/`,
  };
  if (!full) return base;
  return {
    ...base,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    publishingPrinciples: METHODOLOGY_URL,
    correctionsPolicy: METHODOLOGY_URL,
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: APP_NAME,
    inLanguage: SITE_LANG,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function breadcrumbNode(trail: { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function politicalPartyNode(party: Pick<Party, 'id' | 'name' | 'shortName'>): JsonLdNode {
  const url = absoluteUrl(partyHref(party.id));
  return {
    '@type': 'PoliticalParty',
    '@id': `${url}#parti`,
    name: party.name,
    ...(party.shortName !== party.name ? { alternateName: party.shortName } : {}),
    url,
  };
}

export function personNode(name: string): JsonLdNode {
  return { '@type': 'Person', name };
}

/** Sources uniques (par URL), ordre d'apparition conservé : aucune sélection arbitraire. */
export function citationNodes(sources: Source[]): JsonLdNode[] {
  const unique = [...new Map(sources.map((s) => [s.url, s])).values()];
  return unique.map((s) => ({
    '@type': 'CreativeWork',
    name: s.title,
    url: s.url,
    datePublished: s.date,
  }));
}

const HEADLINE_MAX = 110;

export function webPageNode(input: {
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage';
}): JsonLdNode {
  const url = absoluteUrl(input.path);
  return {
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: SITE_LANG,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function articleNode(input: {
  path: string;
  headline: string;
  description: string;
  dateModified: string | null;
  about?: JsonLdNode[];
  mentions?: JsonLdNode[];
  sources: Source[];
}): JsonLdNode {
  const url = absoluteUrl(input.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    headline: input.headline.slice(0, HEADLINE_MAX),
    description: input.description,
    inLanguage: SITE_LANG,
    image: [OG_IMAGE_URL],
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.about?.length ? { about: input.about } : {}),
    ...(input.mentions?.length ? { mentions: input.mentions } : {}),
    citation: citationNodes(input.sources),
  };
}

export function graph(...nodes: JsonLdNode[]): JsonLdGraph {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/** JSON sûr dans un <script> : échappe <, >, &, U+2028 et U+2029 en \uXXXX. */
export function serializeJsonLd(g: JsonLdGraph): string {
  return JSON.stringify(g)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
