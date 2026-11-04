import { APP_NAME } from '@/src/core/config/app';
import { dossierLastmod } from '@/src/programmes/models/legal/legal-dates';
import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';
import { partySectionSources } from '@/src/programmes/models/party-sources.service';
import { beforeParenthesis, displayName } from '@/src/programmes/models/presentation.service';
import type {
  Candidacy,
  Catalog,
  Election,
  GuideSection,
  Party,
  Source,
  Theme,
} from '@/src/programmes/models/programme.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import {
  articleNode,
  breadcrumbNode,
  graph,
  organizationNode,
  personNode,
  politicalPartyNode,
  webPageNode,
  websiteNode,
  type JsonLdGraph,
  type JsonLdNode,
} from '@/src/programmes/models/seo/json-ld';
import {
  hasLegalSection,
  partyHref,
  partySectionLabel,
  type PartySection,
} from '@/src/programmes/models/seo/party-sections';
import {
  expandRoutes,
  SITE_ROUTES,
  type RouteParams,
  type RoutePattern,
} from '@/src/programmes/models/seo/site-routes';
import { domainOf } from '@/src/programmes/models/verification.service';

export type Robots = 'index, follow' | 'noindex, follow';

export type Breadcrumb = { name: string; path: string }[];

export type PageMeta = {
  /** Title complet, marque comprise. */
  title: string;
  /** 50 à 160 caractères, sans adjectif évaluatif. */
  description: string;
  /** Chemin canonique : '/partis/rn/histoire'. Jamais de requête. */
  path: string;
  robots: Robots;
  ogType: 'website' | 'article';
  /** Une seule balise script par page : un graphe @graph. */
  jsonLd: JsonLdGraph | null;
  /** Fil d'Ariane (même source pour le visuel desktop et le JSON-LD). Vide sur l'accueil. */
  breadcrumb: Breadcrumb;
};

export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 160;
export const OG_IMAGE_ALT =
  'Travée : comprendre la politique française, chaque information sourcée et datée';

export const brandTitle = (core: string) => `${core} · ${APP_NAME}`;

/** Coupe à une limite de mot et ajoute « … » si le texte dépasse `max`. */
export function clampText(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = text[max - 1] === ' ' ? max - 1 : cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? text.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** « Nom (SIGLE) », ou « Nom » si le sigle est identique au nom ou déjà contenu dedans. */
export function partyLabel(party: Pick<Party, 'name' | 'shortName'>): string {
  const name = party.name.toLowerCase();
  const short = party.shortName.toLowerCase();
  return name === short || name.includes(short) ? party.name : `${party.name} (${party.shortName})`;
}

const HOME = { name: 'Accueil', path: '/' };

const robotsOf = (pattern: RoutePattern): Robots =>
  SITE_ROUTES[pattern].indexable ? 'index, follow' : 'noindex, follow';

const lastmodOf = (pattern: RoutePattern, catalog: Catalog, params: RouteParams = {}) =>
  SITE_ROUTES[pattern].lastmod(catalog, params);

type PageKind = 'webpage' | 'collection' | 'article';

const pageGraph = (input: {
  path: string;
  name: string;
  description: string;
  breadcrumb: Breadcrumb;
  kind: PageKind;
  dateModified?: string | null;
  about?: JsonLdNode[];
  mentions?: JsonLdNode[];
  sources?: Source[];
}): JsonLdGraph =>
  graph(
    organizationNode(false),
    input.kind === 'article'
      ? articleNode({
          path: input.path,
          headline: input.name,
          description: input.description,
          dateModified: input.dateModified ?? null,
          about: input.about,
          mentions: input.mentions,
          sources: input.sources ?? [],
        })
      : webPageNode({
          path: input.path,
          name: input.name,
          description: input.description,
          type: input.kind === 'collection' ? 'CollectionPage' : 'WebPage',
        }),
    breadcrumbNode(input.breadcrumb)
  );

const make = (
  meta: Omit<PageMeta, 'robots' | 'ogType' | 'jsonLd'> & {
    kind: PageKind;
    pattern: RoutePattern;
    name: string;
    dateModified?: string | null;
    about?: JsonLdNode[];
    mentions?: JsonLdNode[];
    sources?: Source[];
  }
): PageMeta => ({
  title: meta.title,
  description: meta.description,
  path: meta.path,
  robots: robotsOf(meta.pattern),
  ogType: meta.kind === 'article' ? 'article' : 'website',
  breadcrumb: meta.breadcrumb,
  jsonLd: SITE_ROUTES[meta.pattern].indexable
    ? pageGraph({
        path: meta.path,
        name: meta.name,
        description: meta.description,
        breadcrumb: meta.breadcrumb,
        kind: meta.kind,
        dateModified: meta.dateModified,
        about: meta.about,
        mentions: meta.mentions,
        sources: meta.sources,
      })
    : null,
});

export function homeMeta(_catalog: Catalog): PageMeta {
  const title = `${APP_NAME} · Comprendre la politique française et la présidentielle 2027`;
  const description =
    'Institutions, partis, grands débats et présidentielle 2027 expliqués, avec une source datée pour chaque information. Site indépendant et non partisan.';
  return {
    title,
    description,
    path: '/',
    robots: 'index, follow',
    ogType: 'website',
    breadcrumb: [],
    jsonLd: graph(organizationNode(true), websiteNode()),
  };
}

const RUBRICS = {
  partis: {
    pattern: '/partis',
    name: 'Partis',
    title: 'Les partis politiques français : histoire, idées, positions',
    description: (catalog: Catalog) =>
      `Les ${catalog.parties.length} partis présentés dans l'ordre alphabétique, avec le même format pour chacun : histoire, idées, positions et propositions pour 2027, sources à l'appui.`,
  },
  comprendre: {
    pattern: '/comprendre',
    name: 'Comprendre',
    title: 'Comprendre la politique française simplement',
    description: () =>
      'Institutions, pouvoirs du président, mode de scrutin, classement des partis : les bases de la politique française, chaque information étant sourcée.',
  },
  debats: {
    pattern: '/debats',
    name: 'Débats',
    title: 'Les grands débats politiques : enjeux et propositions',
    description: () =>
      'Économie, immigration, écologie, santé : les enjeux, les chiffres officiels et les propositions des partis sur chaque thème, dans le même format pour tous.',
  },
  elections: {
    pattern: '/elections',
    name: 'Élections',
    title: 'Les élections en France : calendrier et règles',
    description: () =>
      'Les élections à venir en France : calendrier, candidatures déclarées et règles du scrutin, avec les sources officielles.',
  },
} as const;

export function rubricMeta(kind: keyof typeof RUBRICS, catalog: Catalog): PageMeta {
  const rubric = RUBRICS[kind];
  const title = brandTitle(rubric.title);
  const description = rubric.description(catalog);
  return make({
    title,
    description,
    path: rubric.pattern,
    breadcrumb: [HOME, { name: rubric.name, path: rubric.pattern }],
    kind: 'collection',
    pattern: rubric.pattern,
    name: rubric.title,
  });
}

export type PartyPageContext = {
  party: Party;
  questionCount: number;
  presidential: { election: Election; candidacy: Candidacy } | null;
  /** Dossier de procédures, seulement quand la section existe pour tous les partis. */
  legal: LegalDossier | null;
  sources: Record<PartySection, Source[]>;
};

export function partyPageContext(party: Party, catalog: Catalog): PartyPageContext {
  const election = catalog.elections.find((e) => e.featured) ?? null;
  const candidacy = election ? party.candidacies[election.id] : undefined;
  const legal = hasLegalSection(catalog)
    ? (catalog.legal.find((d) => d.partyId === party.id) ?? null)
    : null;
  const sourcesFor = (section: PartySection) =>
    partySectionSources(party, section, election?.id ?? null, legal);
  return {
    party,
    questionCount: catalog.questions.length,
    presidential: election && candidacy ? { election, candidacy } : null,
    legal,
    sources: {
      'en-bref': sourcesFor('en-bref'),
      histoire: sourcesFor('histoire'),
      positions: sourcesFor('positions'),
      'programme-2027': sourcesFor('programme-2027'),
      procedures: sourcesFor('procedures'),
    },
  };
}

const PARTY_PATTERNS: Record<PartySection, RoutePattern> = {
  'en-bref': '/partis/[id]',
  histoire: '/partis/[id]/histoire',
  positions: '/partis/[id]/positions',
  'programme-2027': '/partis/[id]/programme-2027',
  procedures: '/partis/[id]/procedures-judiciaires',
};

const PARTY_PATTERN_SECTIONS = Object.fromEntries(
  Object.entries(PARTY_PATTERNS).map(([section, pattern]) => [pattern, section])
) as Record<string, PartySection>;

export function partySectionMeta(ctx: PartyPageContext, section: PartySection): PageMeta {
  const { party, questionCount, presidential, legal } = ctx;
  if ((section === 'programme-2027' && !presidential) || (section === 'procedures' && !legal)) {
    return nonIndexableMeta(party.name, partyHref(party.id, section));
  }
  // Le dossier de procédures a sa propre date de recensement, distincte de celle de la fiche.
  const date = formatLongDate(section === 'procedures' ? legal!.reviewedOn : party.lastVerified);
  const label = partyLabel(party);

  const titleCore = (name: string): string => {
    switch (section) {
      case 'en-bref':
        return `${name} : histoire, idées et positions`;
      case 'histoire':
        return `${name} : histoire, fondateurs et dates clés`;
      case 'positions':
        return `${name} : positions sur ${questionCount} questions`;
      case 'programme-2027':
        return `${name} : propositions pour la présidentielle 2027`;
      case 'procedures':
        return `${name} : procédures judiciaires`;
    }
  };
  // Même règle pour tous : le sigle seul quand le nom complet allonge trop le title.
  const title =
    brandTitle(titleCore(label)).length <= TITLE_MAX
      ? brandTitle(titleCore(label))
      : brandTitle(titleCore(party.shortName));

  const descriptionFor = (name: string): string => {
    switch (section) {
      case 'en-bref':
        return `${name} : histoire, idées et positions sur les grands débats, chaque information sourcée et datée. Fiche vérifiée le ${date}.`;
      case 'histoire':
        return `Les origines de ${name}, ses fondateurs et figures, ses dates clés et ses courants de pensée, résumés et sourcés. Fiche vérifiée le ${date}.`;
      case 'positions':
        return `Ce que défend ${name} sur ${questionCount} questions de société, d'après ses programmes, ses votes et ses déclarations datés. Fiche vérifiée le ${date}.`;
      case 'programme-2027':
        return `${name} : propositions pour 2027, thème par thème, avec leurs sources. ${presidential!.candidacy.candidateName} (${beforeParenthesis(presidential!.candidacy.statusLabel)}). Fiche vérifiée le ${date}.`;
      case 'procedures':
        // Jamais de nom de personne ici : un extrait « X mis en examen » hors contexte serait trompeur.
        return `Procédures judiciaires concernant ${name}, ses dirigeants, candidats et élus nationaux : statut exact, décisions, sources. Arrêté au ${date}.`;
    }
  };
  const full = descriptionFor(label);
  const description = full.length <= DESCRIPTION_MAX ? full : descriptionFor(party.shortName);

  const path = partyHref(party.id, section);
  const trail: Breadcrumb = [
    HOME,
    { name: 'Partis', path: '/partis' },
    { name: party.name, path: partyHref(party.id) },
    ...(section === 'en-bref' ? [] : [{ name: partySectionLabel(section), path }]),
  ];
  return make({
    title,
    description,
    path,
    breadcrumb: trail,
    kind: 'article',
    pattern: PARTY_PATTERNS[section],
    name: section === 'en-bref' ? party.name : `${party.name} · ${partySectionLabel(section)}`,
    dateModified: section === 'procedures' ? dossierLastmod(legal!) : party.lastVerified,
    about: [
      politicalPartyNode(party),
      ...(section === 'programme-2027' ? [personNode(presidential!.candidacy.candidateName)] : []),
    ],
    // Procédures : citations nommées par domaine, le titre d'un article étant souvent nominatif.
    sources:
      section === 'procedures'
        ? ctx.sources[section].map((s) => ({ ...s, title: domainOf(s.url) }))
        : ctx.sources[section],
  });
}

export function debateMeta(theme: Theme, catalog: Catalog): PageMeta {
  const election = catalog.elections.find((e) => e.featured) ?? null;
  const parties = [...catalog.parties]
    .filter((p) => election && p.candidacies[election.id])
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const description = `Enjeux, chiffres officiels et propositions des ${parties.length} partis sur le thème « ${theme.title} », dans le même format et par ordre alphabétique.`;
  const path = `/debats/${theme.id}`;
  const questionIds = catalog.questions.filter((q) => q.theme === theme.id).map((q) => q.id);
  const sources = [
    ...theme.keyFigures.map((f) => f.source),
    ...parties
      .flatMap((p) => p.candidacies[election!.id].themes[theme.id]?.measures ?? [])
      .flatMap((m) => m.sources),
    ...parties.flatMap((p) => questionIds.flatMap((id) => p.stances[id]?.sources ?? [])),
  ];
  return make({
    title: brandTitle(`${theme.title} : que proposent les partis ?`),
    description,
    path,
    breadcrumb: [HOME, { name: 'Débats', path: '/debats' }, { name: theme.title, path }],
    kind: 'article',
    pattern: '/debats/[id]',
    name: theme.title,
    dateModified: lastmodOf('/debats/[id]', catalog, { id: theme.id }),
    about: [{ '@type': 'Thing', name: theme.title }],
    mentions: parties.map(politicalPartyNode),
    sources,
  });
}

export function guideSectionMeta(section: GuideSection): PageMeta {
  const path = `/comprendre/${section.id}`;
  const description = clampText(section.summary, DESCRIPTION_MAX);
  return make({
    title: brandTitle(section.title),
    description,
    path,
    breadcrumb: [HOME, { name: 'Comprendre', path: '/comprendre' }, { name: section.title, path }],
    kind: 'article',
    pattern: '/comprendre/[id]',
    name: section.title,
    dateModified: section.lastVerified ?? null,
    sources: section.blocks.flatMap((b) => b.sources),
  });
}

export function electionMeta(election: Election, catalog: Catalog): PageMeta {
  const path = `/elections/${election.id}`;
  const description =
    'Calendrier, candidatures déclarées et leur statut daté, parrainages et règles du scrutin, avec les sources officielles.';
  return make({
    title: brandTitle(`${election.title} : dates, candidats et règles`),
    description,
    path,
    breadcrumb: [HOME, { name: 'Élections', path: '/elections' }, { name: election.title, path }],
    kind: 'article',
    pattern: '/elections/[id]',
    name: election.title,
    dateModified: lastmodOf('/elections/[id]', catalog, { id: election.id }),
    sources: [
      ...election.summarySources,
      ...[...election.keyDates, ...election.rounds].flatMap((s) => s.sources),
    ],
  });
}

export function quizMeta(questionCount: number): PageMeta {
  return make({
    title: brandTitle('Test politique : de quels partis êtes-vous proche ?'),
    description: `${questionCount} affirmations, environ 5 minutes : comparez vos réponses aux positions sourcées des partis. Anonyme, aucune réponse envoyée.`,
    path: '/me-situer',
    breadcrumb: [HOME, { name: 'Me situer', path: '/me-situer' }],
    kind: 'webpage',
    pattern: '/me-situer',
    name: 'Me situer',
  });
}

export function methodologyMeta(): PageMeta {
  return make({
    title: brandTitle('Méthodologie, sources et corrections'),
    description:
      'Comment Travée choisit ses sources, code les positions des partis, calcule les proximités et corrige ses erreurs.',
    path: '/methodologie',
    breadcrumb: [HOME, { name: 'Méthodologie', path: '/methodologie' }],
    kind: 'webpage',
    pattern: '/methodologie',
    name: 'Méthodologie',
  });
}

export function correctionsMeta(): PageMeta {
  return make({
    title: brandTitle('Journal des corrections'),
    description:
      'Toutes les modifications de fond du contenu de Travée, datées, avec les pages concernées : corrections, mises à jour, ajouts et retraits.',
    path: '/corrections',
    breadcrumb: [HOME, { name: 'Corrections', path: '/corrections' }],
    kind: 'collection',
    pattern: '/corrections',
    name: 'Journal des corrections',
  });
}

/** Passeport, résultats, parcours, 404, contenus introuvables : jamais indexés. */
export function nonIndexableMeta(title: string, path: string): PageMeta {
  return {
    title: brandTitle(title),
    description:
      'Page de navigation de Travée : comprendre la politique française, chaque information sourcée et datée.',
    path,
    robots: 'noindex, follow',
    ogType: 'website',
    jsonLd: null,
    breadcrumb: [],
  };
}

/** Libellé d'un lien vers une fiche : un seul gabarit pour tous les partis. */
export function partyLinkLabel(
  party: Pick<Party, 'name' | 'shortName' | 'id'>,
  section: PartySection
): string {
  return section === 'programme-2027'
    ? `Toutes les propositions de ${displayName(party)} pour 2027 →`
    : party.name;
}

const NON_INDEXABLE_TITLES: Partial<Record<RoutePattern, string>> = {
  '/me-situer/resultats': 'Vos résultats',
  '/parcours/[etape]': 'Parcours citoyen',
  '/passeport': 'Mon passeport citoyen',
};

/** Métadonnées de toutes les pages du registre (tests, script post-export). */
export function allPageMetas(catalog: Catalog): PageMeta[] {
  return expandRoutes(catalog).map(({ pattern, path }): PageMeta => {
    const id = path.split('/')[2];
    switch (pattern) {
      case '/':
        return homeMeta(catalog);
      case '/partis':
        return rubricMeta('partis', catalog);
      case '/comprendre':
        return rubricMeta('comprendre', catalog);
      case '/debats':
        return rubricMeta('debats', catalog);
      case '/elections':
        return rubricMeta('elections', catalog);
      case '/comprendre/[id]':
        return guideSectionMeta(catalog.guide.find((s) => s.id === id)!);
      case '/debats/[id]':
        return debateMeta(catalog.themes.find((t) => t.id === id)!, catalog);
      case '/elections/[id]':
        return electionMeta(catalog.elections.find((e) => e.id === id)!, catalog);
      case '/me-situer':
        return quizMeta(catalog.questions.length);
      case '/methodologie':
        return methodologyMeta();
      case '/corrections':
        return correctionsMeta();
      case '/partis/[id]':
      case '/partis/[id]/histoire':
      case '/partis/[id]/positions':
      case '/partis/[id]/programme-2027':
      case '/partis/[id]/procedures-judiciaires': {
        const section = PARTY_PATTERN_SECTIONS[pattern];
        return partySectionMeta(
          partyPageContext(catalog.parties.find((p) => p.id === id)!, catalog),
          section
        );
      }
      default:
        return nonIndexableMeta(NON_INDEXABLE_TITLES[pattern] ?? 'Page', path);
    }
  });
}
