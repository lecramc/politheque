import { APP_NAME, SITE_LANG, SITE_URL } from '@/src/core/config/app';
import type {
  FaqEntry,
  LexiconEntry,
  Party,
  Source,
} from '@/src/programmes/models/programme.model';
import { partyHref } from '@/src/programmes/models/seo/party-sections';
import { absoluteUrl } from '@/src/programmes/models/seo/site-routes';

export type JsonLdNode = { '@type': string | string[]; '@id'?: string; [key: string]: unknown };
export type JsonLdGraph = { '@context': 'https://schema.org'; '@graph': JsonLdNode[] };

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const OG_IMAGE_URL = `${SITE_URL}/og.png`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;

/** Description du site, reprise par `Organization` (E-E-A-T) : mêmes mots que llms.txt. */
export const SITE_DESCRIPTION =
  'Site indépendant et non partisan pour comprendre la politique française : institutions, partis, grands débats, présidentielle 2027. Chaque information est sourcée et datée.';

const METHODOLOGY_URL = `${SITE_URL}/methodologie`;
const CORRECTIONS_URL = `${SITE_URL}/corrections`;

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
    description: SITE_DESCRIPTION,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    publishingPrinciples: METHODOLOGY_URL,
    correctionsPolicy: CORRECTIONS_URL,
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: APP_NAME,
    alternateName: [APP_NAME],
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

/**
 * Une source de référence (`statistique` : textes officiels, encyclopédies, données publiques)
 * porte sa date de consultation, pas sa date de publication : `datePublished` est alors omis.
 * Règle sans date butoir, pour ne pas dépendre du moment où la source a été ajoutée.
 */
export function isConsultationDate(source: Pick<Source, 'kind' | 'date'>): boolean {
  return source.kind === 'statistique';
}

/** Sources uniques (par URL), ordre d'apparition conservé : aucune sélection arbitraire. */
export function citationNodes(sources: Source[]): JsonLdNode[] {
  const unique = [...new Map(sources.map((s) => [s.url, s])).values()];
  return unique.map((s) => ({
    '@type': 'CreativeWork',
    name: s.title,
    url: s.url,
    ...(isConsultationDate(s) ? {} : { datePublished: s.date }),
  }));
}

/** Liste ordonnée de personnes : l'ordre est celui de la page (alphabétique, sans hiérarchie). */
export function personListNode(path: string, name: string, names: string[]): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#candidats`,
    name,
    url: absoluteUrl(path),
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: names.length,
    itemListElement: names.map((person, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: personNode(person),
    })),
  };
}

/** Scrutin daté (un tour) : date officielle déjà présente dans les données, jamais déduite. */
export function eventNode(input: { name: string; path: string; startDate: string }): JsonLdNode {
  return {
    '@type': 'Event',
    name: input.name,
    startDate: input.startDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Country', name: 'France' },
    url: absoluteUrl(input.path),
  };
}

/** URL d'un terme du lexique : la page, plus l'ancre du terme. */
export const lexiconTermUrl = (pagePath: string, id: string) => `${absoluteUrl(pagePath)}#${id}`;

/** Le lexique et ses termes : un nœud par terme, rattaché à l'ensemble par `inDefinedTermSet`. */
export function lexiconNodes(
  pagePath: string,
  name: string,
  entries: LexiconEntry[]
): JsonLdNode[] {
  const setId = `${absoluteUrl(pagePath)}#lexique`;
  return [
    {
      '@type': 'DefinedTermSet',
      '@id': setId,
      name,
      url: absoluteUrl(pagePath),
      inLanguage: SITE_LANG,
    },
    ...entries.map(
      (entry): JsonLdNode => ({
        '@type': 'DefinedTerm',
        '@id': lexiconTermUrl(pagePath, entry.id),
        name: entry.term,
        description: entry.definition,
        url: lexiconTermUrl(pagePath, entry.id),
        inDefinedTermSet: { '@id': setId },
      })
    ),
  ];
}

/** Questions et réponses courtes affichées sur la page (jamais un texte absent de la page). */
export function faqPageNode(path: string, entries: FaqEntry[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    url: absoluteUrl(path),
    inLanguage: SITE_LANG,
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
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
