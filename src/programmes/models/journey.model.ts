import type { Catalog } from '@/src/programmes/models/programme.model';
import {
  contentKey,
  parseContentKey,
  type ContentKey,
} from '@/src/programmes/models/reading-progress.model';
import { partyHref } from '@/src/programmes/models/seo/party-sections';

export type JourneyStepId =
  | 'les-bases'
  | 'les-institutions'
  | 'les-partis'
  | 'les-grands-debats'
  | 'presidentielle-2027'
  | 'me-situer';

/** Ordre conseillé (jamais imposé). */
export const JOURNEY_STEP_IDS: readonly JourneyStepId[] = [
  'les-bases',
  'les-institutions',
  'les-partis',
  'les-grands-debats',
  'presidentielle-2027',
  'me-situer',
];

export type JourneyItemKind = 'guide' | 'party' | 'debate' | 'election' | 'quiz';

export type JourneyItem = {
  key: ContentKey;
  kind: JourneyItemKind;
  /** Titre réel : section, nom du parti, thème… */
  title: string;
  /** Route canonique. */
  href: string;
  /** Anneau PartyDot seulement, comme partout sur le site. */
  partyColor?: string;
};

export type JourneyStep = {
  id: JourneyStepId;
  /** 1..6 */
  index: number;
  title: string;
  /** Nom Ionicons. */
  icon: string;
  unit: { one: string; many: string };
  items: JourneyItem[];
};

export type Journey = readonly JourneyStep[];

/** Sections du guide des étapes 1, 2 et 5 : la seule partie codée en dur. */
export const JOURNEY_GUIDE_IDS: Record<
  'les-bases' | 'les-institutions' | 'presidentielle-2027',
  string[]
> = {
  'les-bases': ['gauche-droite', 'classement-des-partis', 'desinformation'],
  'les-institutions': ['institutions', 'pouvoirs-du-president', 'union-europeenne', 'budget-dette'],
  'presidentielle-2027': ['election-presidentielle', 'comment-voter'],
};

const STEP_DEFINITIONS: Record<
  JourneyStepId,
  { title: string; icon: string; unit: JourneyStep['unit'] }
> = {
  'les-bases': {
    title: 'Les bases',
    icon: 'book-outline',
    unit: { one: 'lecture', many: 'lectures' },
  },
  'les-institutions': {
    title: 'Les institutions',
    icon: 'business-outline',
    unit: { one: 'lecture', many: 'lectures' },
  },
  'les-partis': {
    title: 'Les partis',
    icon: 'people-outline',
    unit: { one: 'fiche', many: 'fiches' },
  },
  'les-grands-debats': {
    title: 'Les grands débats',
    icon: 'chatbubbles-outline',
    unit: { one: 'débat', many: 'débats' },
  },
  'presidentielle-2027': {
    title: 'La présidentielle 2027',
    icon: 'calendar-outline',
    unit: { one: 'lecture', many: 'lectures' },
  },
  'me-situer': {
    title: 'Me situer',
    icon: 'compass-outline',
    unit: { one: 'affirmation', many: 'affirmations' },
  },
};

/** Route canonique d'un contenu à partir de sa clé (l'onglet n'en fait jamais partie). */
export function hrefOf(key: ContentKey): string {
  const parsed = parseContentKey(key);
  if (!parsed) return '/';
  switch (parsed.type) {
    case 'guide':
      return `/comprendre/${parsed.id}`;
    case 'party':
      return partyHref(parsed.id);
    case 'debate':
      return `/debats/${parsed.id}`;
    case 'election':
      return `/elections/${parsed.id}`;
    case 'quiz':
      return '/me-situer';
    default:
      return '/passeport';
  }
}

/**
 * Lien d'une étape : sa place dans le site. Les pages `/parcours/*` n'existent plus (elles
 * redirigent vers ces mêmes adresses) : les chapitres sont dans Comprendre, les fiches et les
 * débats dans Partis.
 */
const STEP_HREFS: Record<JourneyStepId, string> = {
  'les-bases': '/comprendre#les-bases',
  'les-institutions': '/comprendre#les-institutions',
  'les-partis': '/partis',
  'les-grands-debats': '/partis#debats',
  'presidentielle-2027': '/comprendre#presidentielle-2027',
  'me-situer': '/me-situer',
};

export const stepHref = (step: Pick<JourneyStep, 'id'>): string => STEP_HREFS[step.id];

/** Construit le parcours depuis le catalogue (l'ordre des partis est celui du catalogue). */
export function buildJourney(catalog: Catalog): Journey {
  const guideItem = (id: string): JourneyItem[] => {
    const section = catalog.guide.find((s) => s.id === id);
    if (!section) return [];
    const key = contentKey.guide(id);
    return [{ key, kind: 'guide', title: section.title, href: hrefOf(key) }];
  };
  const guideItems = (stepId: keyof typeof JOURNEY_GUIDE_IDS) =>
    JOURNEY_GUIDE_IDS[stepId].flatMap(guideItem);

  const featured = catalog.elections.find((e) => e.featured);
  const electionItems: JourneyItem[] = featured
    ? [
        {
          key: contentKey.election(featured.id),
          kind: 'election',
          title: featured.rounds[0]
            ? `Les candidatures ${featured.rounds[0].date.slice(0, 4)}`
            : featured.title,
          href: hrefOf(contentKey.election(featured.id)),
        },
      ]
    : [];

  const itemsByStep: Record<JourneyStepId, JourneyItem[]> = {
    'les-bases': guideItems('les-bases'),
    'les-institutions': guideItems('les-institutions'),
    'les-partis': catalog.parties.map((party) => ({
      key: contentKey.party(party.id),
      kind: 'party' as const,
      title: party.name,
      href: hrefOf(contentKey.party(party.id)),
      partyColor: party.color,
    })),
    'les-grands-debats': catalog.themes.map((theme) => ({
      key: contentKey.debate(theme.id),
      kind: 'debate' as const,
      title: theme.title,
      href: hrefOf(contentKey.debate(theme.id)),
    })),
    'presidentielle-2027': [...guideItems('presidentielle-2027'), ...electionItems],
    'me-situer': [
      {
        key: contentKey.quizDone,
        kind: 'quiz',
        title: 'Le questionnaire',
        href: hrefOf(contentKey.quizDone),
      },
    ],
  };

  return JOURNEY_STEP_IDS.map((id, i) => ({
    id,
    index: i + 1,
    ...STEP_DEFINITIONS[id],
    items: itemsByStep[id],
  }));
}
