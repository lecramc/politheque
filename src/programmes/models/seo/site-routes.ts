import { SITE_URL } from '@/src/core/config/app';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { JOURNEY_STEP_IDS } from '@/src/programmes/models/journey.model';
import { dossierLastmod } from '@/src/programmes/models/legal/legal-dates';
import type { Catalog, Party } from '@/src/programmes/models/programme.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';
import {
  availableSections,
  hasLegalSection,
  type PartySection,
} from '@/src/programmes/models/seo/party-sections';

export type RoutePattern =
  | '/'
  | '/comprendre'
  | '/comprendre/[id]'
  | '/partis'
  | '/partis/[id]'
  | '/partis/[id]/histoire'
  | '/partis/[id]/positions'
  | '/partis/[id]/programme-2027'
  | '/partis/[id]/procedures-judiciaires'
  | '/elections'
  | '/elections/[id]'
  | '/debats'
  | '/debats/[id]'
  | '/me-situer'
  | '/me-situer/resultats'
  | '/methodologie'
  | '/corrections'
  | '/parcours/[etape]'
  | '/passeport';

export type RouteParams = Record<string, string>;

export function fillPattern(pattern: RoutePattern, params: RouteParams): string {
  return pattern.replace(/\[(\w+)\]/g, (_, key: string) => params[key]);
}

/** URL absolue canonique : sans barre finale (sauf l'accueil), sans extension ni requête. */
export function absoluteUrl(path: string): string {
  if (path === '/') return `${SITE_URL}/`;
  if (!path.startsWith('/') || /[?#]|\.html$|\/$/.test(path)) {
    throw new Error(`Chemin canonique invalide : ${path}`);
  }
  return `${SITE_URL}${path}`;
}

export type RouteDefinition = {
  /** Paramètres de l'export statique (ordre du catalogue, alphabétique pour les partis). */
  params?: (catalog: Catalog) => RouteParams[];
  /** false → <meta name="robots" content="noindex, follow"> et absent du sitemap. */
  indexable: boolean;
  /** Date ISO de la dernière vérification réelle ; null → pas de <lastmod>. */
  lastmod: (catalog: Catalog, params: RouteParams) => string | null;
};

export type SiteUrl = {
  pattern: RoutePattern;
  path: string;
  indexable: boolean;
  lastmod: string | null;
};

const featuredElectionId = (catalog: Catalog) =>
  catalog.elections.find((e) => e.featured)?.id ?? null;

const sortedParties = (catalog: Catalog): Party[] =>
  [...catalog.parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

const partyDates = (catalog: Catalog) => catalog.parties.map((p) => p.lastVerified);

const partyParams =
  (section: PartySection) =>
  (catalog: Catalog): RouteParams[] =>
    sortedParties(catalog)
      .filter((party) =>
        availableSections(party, featuredElectionId(catalog), hasLegalSection(catalog)).includes(
          section
        )
      )
      .map((party) => ({ id: party.id }));

const partyLastmod = (catalog: Catalog, params: RouteParams) =>
  catalog.parties.find((p) => p.id === params.id)?.lastVerified ?? null;

const partyPage = (section: PartySection): RouteDefinition => ({
  params: partyParams(section),
  indexable: true,
  lastmod: partyLastmod,
});

/** Dossier revu + dernière entrée du journal publiée sur cette page (ajout, correction…). */
const legalLastmod = (catalog: Catalog, partyId: string) => {
  const dossier = catalog.legal.find((d) => d.partyId === partyId);
  if (!dossier) return null;
  const page = `/partis/${partyId}/procedures-judiciaires`;
  const journal = catalog.corrections.filter((e) => e.pages.includes(page)).map((e) => e.date);
  return maxIsoDate([dossierLastmod(dossier), ...journal]);
};

const fixed = (
  indexable: boolean,
  lastmod: RouteDefinition['lastmod'] = () => null
): RouteDefinition => ({ indexable, lastmod });

const allDates = (catalog: Catalog) =>
  maxIsoDate([
    ...partyDates(catalog),
    ...catalog.guide.map((s) => s.lastVerified),
    ...catalog.themes.map((t) => t.lastVerified),
    ...catalog.elections.map((e) => e.lastVerified),
  ]);

/**
 * Registre unique : sitemap, canonical, robots et fichiers de `app/` parlent de la même chose.
 * `lastmod` ne vaut que des dates de vérification réelles (jamais une date de build).
 */
export const SITE_ROUTES: Record<RoutePattern, RouteDefinition> = {
  '/': fixed(true, allDates),
  '/comprendre': fixed(true, (c) => maxIsoDate(c.guide.map((s) => s.lastVerified))),
  '/comprendre/[id]': {
    params: (c) => c.guide.map((s) => ({ id: s.id })),
    indexable: true,
    lastmod: (c, p) => c.guide.find((s) => s.id === p.id)?.lastVerified ?? null,
  },
  '/partis': fixed(true, (c) => maxIsoDate(partyDates(c))),
  '/partis/[id]': partyPage('en-bref'),
  '/partis/[id]/histoire': partyPage('histoire'),
  '/partis/[id]/positions': partyPage('positions'),
  '/partis/[id]/programme-2027': partyPage('programme-2027'),
  '/partis/[id]/procedures-judiciaires': {
    params: partyParams('procedures'),
    indexable: true,
    lastmod: (c, p) => legalLastmod(c, p.id),
  },
  '/elections': fixed(true, (c) =>
    maxIsoDate([...c.elections.map((e) => e.lastVerified), ...partyDates(c)])
  ),
  '/elections/[id]': {
    params: (c) => c.elections.map((e) => ({ id: e.id })),
    indexable: true,
    lastmod: (c, p) =>
      maxIsoDate([
        c.elections.find((e) => e.id === p.id)?.lastVerified,
        ...c.parties.filter((party) => party.candidacies[p.id]).map((party) => party.lastVerified),
      ]),
  },
  '/debats': fixed(true, (c) =>
    maxIsoDate([...c.themes.map((t) => t.lastVerified), ...partyDates(c)])
  ),
  '/debats/[id]': {
    params: (c) => c.themes.map((t) => ({ id: t.id })),
    indexable: true,
    // La page affiche les propositions et positions des partis : leurs dates comptent.
    lastmod: (c, p) =>
      maxIsoDate([c.themes.find((t) => t.id === p.id)?.lastVerified, ...partyDates(c)]),
  },
  '/me-situer': fixed(true, (c) => maxIsoDate(partyDates(c))),
  '/me-situer/resultats': fixed(false),
  '/methodologie': fixed(true),
  // Corrections triées du plus récent au plus ancien : la première date est la dernière modification.
  '/corrections': fixed(true, (c) => maxIsoDate(c.corrections.map((e) => e.date))),
  '/parcours/[etape]': {
    params: () => JOURNEY_STEP_IDS.filter((id) => id !== 'me-situer').map((etape) => ({ etape })),
    indexable: false,
    lastmod: () => null,
  },
  '/passeport': fixed(false),
};

/** Toutes les URL concrètes, dans l'ordre du registre puis du catalogue. */
export function expandRoutes(catalog: Catalog): SiteUrl[] {
  return (Object.entries(SITE_ROUTES) as [RoutePattern, RouteDefinition][]).flatMap(
    ([pattern, def]) =>
      (def.params ? def.params(catalog) : [{}]).map((params) => ({
        pattern,
        path: fillPattern(pattern, params),
        indexable: def.indexable,
        lastmod: def.indexable ? def.lastmod(catalog, params) : null,
      }))
  );
}

/** Pour les fichiers app/ : `export const generateStaticParams = staticParamsFor('/partis/[id]')`. */
export function staticParamsFor(pattern: RoutePattern): () => RouteParams[] {
  return () => SITE_ROUTES[pattern].params?.(buildStaticCatalog()) ?? [];
}
