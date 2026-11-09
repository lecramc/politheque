import { APP_NAME } from '@/src/core/config/app';
import { buildCandidateList } from '@/src/programmes/models/candidates.service';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { dossierLastmod } from '@/src/programmes/models/legal/legal-dates';
import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';
import { partySectionSources } from '@/src/programmes/models/party-sources.service';
import {
  beforeParenthesis,
  displayName,
  stepLabel,
} from '@/src/programmes/models/presentation.service';
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
  eventNode,
  faqPageNode,
  graph,
  lexiconNodes,
  personListNode,
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
  /** `false` : ni canonical ni og:url (page d'erreur, qui n'a pas d'adresse propre). */
  canonical?: boolean;
};

export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 160;
export const OG_IMAGE_ALT =
  'Polithèque : comprendre la politique française, chaque information sourcée et datée';

/**
 * « Titre · Polithèque ». Même règle pour toutes les pages : si l'ensemble dépasse TITLE_MAX,
 * le nom du site est retiré plutôt que de couper le titre.
 */
export const brandTitle = (core: string) => {
  const branded = `${core} · ${APP_NAME}`;
  return branded.length <= TITLE_MAX ? branded : core;
};

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
  extraNodes?: JsonLdNode[];
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
    breadcrumbNode(input.breadcrumb),
    ...(input.extraNodes ?? [])
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
    extraNodes?: JsonLdNode[];
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
        extraNodes: meta.extraNodes,
      })
    : null,
});

export function homeMeta(_catalog: Catalog): PageMeta {
  const title = `${APP_NAME} · Comprendre la politique française, présidentielle 2027`;
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
      `Les ${catalog.parties.length} partis dans l'ordre alphabétique, le même format pour chacun : programme, positions, histoire. Comparez deux partis ou parcourez les grands débats.`,
  },
  comprendre: {
    pattern: '/comprendre',
    name: 'Comprendre',
    title: 'Comprendre la politique française simplement',
    description: () =>
      'Institutions, pouvoirs du président, mode de scrutin, classement des partis : les bases de la politique française, chaque information étant sourcée.',
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
  themeCount: number;
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
      programme: sourcesFor('programme'),
      histoire: sourcesFor('histoire'),
      positions: sourcesFor('positions'),
      procedures: sourcesFor('procedures'),
    },
    themeCount: catalog.themes.length,
  };
}

const PARTY_PATTERNS: Record<PartySection, RoutePattern> = {
  programme: '/partis/[id]/programme-2027',
  histoire: '/partis/[id]/histoire',
  positions: '/partis/[id]/positions',
  procedures: '/partis/[id]/procedures-judiciaires',
};

const PARTY_PATTERN_SECTIONS = Object.fromEntries(
  Object.entries(PARTY_PATTERNS).map(([section, pattern]) => [pattern, section])
) as Record<string, PartySection>;

export function partySectionMeta(ctx: PartyPageContext, section: PartySection): PageMeta {
  const { party, questionCount, presidential, legal } = ctx;
  if ((section === 'programme' && !presidential) || (section === 'procedures' && !legal)) {
    return nonIndexableMeta(party.name, partyHref(party.id, section));
  }
  // Le dossier de procédures a sa propre date de recensement, distincte de celle de la fiche.
  const date = formatLongDate(section === 'procedures' ? legal!.reviewedOn : party.lastVerified);
  const label = partyLabel(party);

  const titleCore = (name: string): string => {
    switch (section) {
      case 'histoire':
        return `${name} : histoire, fondateurs et dates clés`;
      case 'positions':
        return `${name} : positions sur ${questionCount} questions`;
      case 'programme':
        return `${name} : programme 2027`;
      case 'procedures':
        return `${name} : procédures judiciaires`;
    }
  };
  // Même règle pour tous : le sigle seul quand le nom complet allonge trop le title.
  // Programme : jamais le sigle seul (le nom complet est la requête d'entité) ; la marque saute avant le nom.
  const fits = (core: string) => core.length <= TITLE_MAX;
  const title =
    section === 'programme'
      ? brandTitle(fits(titleCore(label)) ? titleCore(label) : titleCore(party.name))
      : `${titleCore(label)} · ${APP_NAME}`.length <= TITLE_MAX
        ? brandTitle(titleCore(label))
        : brandTitle(titleCore(party.shortName));

  const descriptionFor = (name: string): string => {
    switch (section) {
      case 'histoire':
        return `${name} : origines, fondateurs, dates clés et courants de pensée, résumés et sourcés. Fiche vérifiée le ${date}.`;
      case 'positions':
        return `${name} : ses positions sur ${questionCount} questions, d'après ses programmes, votes et déclarations datés. Fiche vérifiée le ${date}.`;
      case 'programme':
        return `${name} : programme 2027 en ${ctx.themeCount} thèmes, avec ses sources. ${presidential!.candidacy.candidateName} (${beforeParenthesis(presidential!.candidacy.statusLabel)}). Fiche vérifiée le ${date}.`;
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
    ...(section === 'programme' ? [] : [{ name: partySectionLabel(section), path }]),
  ];
  return make({
    title,
    description,
    path,
    breadcrumb: trail,
    kind: 'article',
    pattern: PARTY_PATTERNS[section],
    name: section === 'programme' ? party.name : `${party.name} · ${partySectionLabel(section)}`,
    dateModified: section === 'procedures' ? dossierLastmod(legal!) : party.lastVerified,
    about: [
      politicalPartyNode(party),
      ...(section === 'programme' ? [personNode(presidential!.candidacy.candidateName)] : []),
    ],
    // Procédures : citations réduites au domaine (nom et URL), les titres comme les URL d'articles
    // étant nominatifs. Les sources complètes restent affichées sur la page, par entrée.
    sources:
      section === 'procedures'
        ? ctx.sources[section].map((s) => ({
            ...s,
            title: domainOf(s.url),
            url: `${new URL(s.url).origin}/`,
          }))
        : ctx.sources[section],
  });
}

/**
 * `/partis/[id]` : alias de l'onglet Programme, qui garde son adresse `/programme-2027` (décision
 * D7). Canonical vers l'onglet, hors sitemap, sans JSON-LD. Un seul signal : le canonical, sans
 * `noindex` (les deux se contrediraient). La page n'est de toute façon jamais servie : la 301 passe avant.
 */
export function partyAliasMeta(ctx: PartyPageContext): PageMeta {
  const meta = partySectionMeta(ctx, 'programme');
  return { ...meta, jsonLd: null };
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
    // Pas de niveau « Grands débats » : son adresse (`/partis#debats`) se confond avec `/partis`.
    breadcrumb: [HOME, { name: 'Partis', path: '/partis' }, { name: theme.title, path }],
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
    'Dates du scrutin, comment voter en trois gestes, puis les candidatures déclarées et leur statut daté, avec les sources officielles.';
  return make({
    title: brandTitle(`${election.title} : dates, comment voter, candidats`),
    description,
    path,
    breadcrumb: [HOME, { name: election.title, path }],
    kind: 'article',
    pattern: '/elections/[id]',
    name: election.title,
    dateModified: lastmodOf('/elections/[id]', catalog, { id: election.id }),
    extraNodes: election.rounds
      // Une date « calculée, à confirmer » n'est pas une date officielle : aucun Event.
      .filter((round) => !stepLabel(round.label).note)
      .map((round) =>
        eventNode({
          name: `${election.title} : ${stepLabel(round.label).title}`,
          path,
          startDate: round.date,
        })
      ),
    sources: [
      ...election.summarySources,
      ...[...election.keyDates, ...election.rounds].flatMap((s) => s.sources),
    ],
  });
}

export function lexiconMeta(catalog: Catalog): PageMeta {
  const path = CONTENUS_2027_PATHS.lexicon;
  const count = catalog.lexicon.length;
  const name = 'Lexique de la politique française';
  return make({
    title: brandTitle(`${name} : ${count} mots expliqués`),
    description: `${count} mots de la politique française en ordre alphabétique : 49.3, motion de censure, scrutin majoritaire, parrainages. Chaque définition est sourcée.`,
    path,
    breadcrumb: [HOME, { name: 'Comprendre', path: '/comprendre' }, { name: 'Lexique', path }],
    kind: 'webpage',
    pattern: '/comprendre/lexique',
    name,
    extraNodes: lexiconNodes(path, name, catalog.lexicon),
  });
}

const featuredElectionCrumb = (catalog: Catalog) => {
  const election = catalog.elections.find((e) => e.id === catalog.voter.electionId);
  return {
    name: election?.title ?? 'Élection présidentielle 2027',
    path: CONTENUS_2027_PATHS.election,
  };
};

export function faqMeta(catalog: Catalog): PageMeta {
  const path = CONTENUS_2027_PATHS.faq;
  const count = catalog.faq.length;
  return make({
    title: brandTitle(`Présidentielle 2027 : ${count} questions-réponses`),
    description: `Dates, inscription, parrainages, procuration, second tour : ${count} questions sur la présidentielle 2027, avec une réponse courte et ses sources officielles.`,
    path,
    breadcrumb: [HOME, featuredElectionCrumb(catalog), { name: 'Questions-réponses', path }],
    kind: 'webpage',
    pattern: '/elections/presidentielle-2027/questions',
    name: `Présidentielle 2027 : ${count} questions-réponses`,
    extraNodes: [faqPageNode(path, catalog.faq)],
  });
}

export function voterMeta(catalog: Catalog): PageMeta {
  const path = CONTENUS_2027_PATHS.voter;
  const { voter } = catalog;
  return make({
    title: brandTitle('Comment voter à la présidentielle 2027'),
    description:
      "S'inscrire, vérifier son bureau de vote, donner procuration, voter depuis l'étranger, pièce d'identité : tout pour voter en 2027, avec sources officielles.",
    path,
    breadcrumb: [HOME, featuredElectionCrumb(catalog), { name: 'Comment voter', path }],
    kind: 'article',
    pattern: '/elections/presidentielle-2027/voter',
    name: voter.title,
    dateModified: voter.lastVerified,
    sources: [...voter.summarySources, ...voter.sections.flatMap((s) => s.sources)],
  });
}

export function candidatesMeta(catalog: Catalog): PageMeta {
  const path = CONTENUS_2027_PATHS.candidates;
  const { candidates } = catalog;
  const entries = buildCandidateList(catalog.parties, candidates.candidates, candidates.electionId);
  const name = "Les candidats à l'élection présidentielle 2027";
  return make({
    title: brandTitle(name),
    description: `${entries.length} candidatures déclarées ou annoncées à la présidentielle 2027, en ordre alphabétique : statut daté, sources. Liste officielle : Conseil constitutionnel.`,
    path,
    breadcrumb: [HOME, featuredElectionCrumb(catalog), { name: 'Les candidats', path }],
    kind: 'webpage',
    pattern: '/elections/presidentielle-2027/candidats',
    name,
    extraNodes: [
      personListNode(
        path,
        name,
        entries.map((e) => e.name)
      ),
    ],
  });
}

export function compareMeta(catalog: Catalog): PageMeta {
  const path = '/partis/comparer';
  return make({
    title: brandTitle('Comparer deux partis : programme et positions'),
    description: `Choisissez deux partis parmi les ${catalog.parties.length} : programme 2027 et ${catalog.questions.length} positions côte à côte, thème par thème, sans score ni classement.`,
    path,
    breadcrumb: [HOME, { name: 'Partis', path: '/partis' }, { name: 'Comparer deux partis', path }],
    kind: 'webpage',
    pattern: '/partis/comparer',
    name: 'Comparer deux partis',
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
      'Comment Polithèque choisit ses sources, code les positions des partis, calcule les proximités et corrige ses erreurs.',
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
      'Toutes les modifications de fond du contenu de Polithèque, datées, avec les pages concernées : corrections, mises à jour, ajouts et retraits.',
    path: '/corrections',
    breadcrumb: [HOME, { name: 'Corrections', path: '/corrections' }],
    kind: 'collection',
    pattern: '/corrections',
    name: 'Journal des corrections',
  });
}

/** Passeport, résultats, parcours, 404, contenus introuvables : jamais indexés. */
export function nonIndexableMeta(
  title: string,
  path: string,
  options: { canonical?: boolean } = {}
): PageMeta {
  return {
    title: brandTitle(title),
    description:
      'Page de navigation de Polithèque : comprendre la politique française, chaque information sourcée et datée.',
    path,
    robots: 'noindex, follow',
    ogType: 'website',
    jsonLd: null,
    breadcrumb: [],
    ...(options.canonical === false ? { canonical: false } : {}),
  };
}

/** Libellé d'un lien vers une fiche : un seul gabarit pour tous les partis. */
export function partyLinkLabel(
  party: Pick<Party, 'name' | 'shortName' | 'id'>,
  section: PartySection
): string {
  return section === 'programme'
    ? `Toutes les propositions de ${displayName(party)} pour 2027 →`
    : party.name;
}

const NON_INDEXABLE_TITLES: Partial<Record<RoutePattern, string>> = {
  '/me-situer/resultats': 'Vos résultats',
  '/passeport': 'Ma progression',
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
      case '/comprendre/[id]':
        return guideSectionMeta(catalog.guide.find((s) => s.id === id)!);
      case '/debats/[id]':
        return debateMeta(catalog.themes.find((t) => t.id === id)!, catalog);
      case '/comprendre/lexique':
        return lexiconMeta(catalog);
      case '/elections/presidentielle-2027/questions':
        return faqMeta(catalog);
      case '/elections/presidentielle-2027/voter':
        return voterMeta(catalog);
      case '/elections/presidentielle-2027/candidats':
        return candidatesMeta(catalog);
      case '/elections/[id]':
        return electionMeta(catalog.elections.find((e) => e.id === id)!, catalog);
      case '/partis/comparer':
        return compareMeta(catalog);
      case '/me-situer':
        return quizMeta(catalog.questions.length);
      case '/methodologie':
        return methodologyMeta();
      case '/corrections':
        return correctionsMeta();
      case '/partis/[id]': {
        const party = catalog.parties.find((p) => p.id === id)!;
        return partyAliasMeta(partyPageContext(party, catalog));
      }
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
