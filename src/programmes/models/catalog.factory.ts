import { partyFactory } from '@/src/programmes/models/party.factory';
import type {
  Catalog,
  Election,
  GuideSection,
  Question,
  Theme,
} from '@/src/programmes/models/programme.model';

export const GUIDE_SECTION_IDS = [
  'institutions',
  'pouvoirs-du-president',
  'election-presidentielle',
  'comment-voter',
  'gauche-droite',
  'classement-des-partis',
  'union-europeenne',
  'budget-dette',
  'desinformation',
] as const;

const guideSection = (id: string): GuideSection => ({
  id,
  title: `Section ${id}`,
  icon: 'book-outline',
  summary: '',
  blocks: [],
});

const theme = (id: Theme['id']): Theme => ({
  id,
  title: `Thème ${id}`,
  icon: 'help-outline',
  context: '',
  contextMore: '',
  keyFigures: [],
  debates: [],
});

const question = (id: string): Question => ({
  id,
  theme: 'economie',
  statement: id,
  shortLabel: id,
  help: '',
  axis: 'economique',
  direction: 1,
});

export const electionFactory = (overrides: Partial<Election> = {}): Election => ({
  id: 'presidentielle-2027',
  type: 'presidentielle',
  title: 'Élection présidentielle 2027',
  status: 'a-venir',
  featured: true,
  summary: '',
  summarySources: [],
  rounds: [{ label: '1er tour', date: '2027-04-18', sources: [] }],
  keyDates: [],
  guideSectionIds: [],
  candidaciesNote: '',
  ...overrides,
});

/**
 * Catalogue de test : guide aux vrais ids, 3 partis volontairement non triés (le parcours
 * garde l'ordre du catalogue), 2 thèmes, 1 élection mise en avant, 3 questions.
 */
export const catalogFactory = (overrides: Partial<Catalog> = {}): Catalog => ({
  parties: [
    partyFactory({ id: 'zeta', name: 'Zeta' }),
    partyFactory({ id: 'alpha', name: 'Alpha' }),
    partyFactory({ id: 'milieu', name: 'Milieu' }),
  ],
  elections: [electionFactory()],
  themes: [theme('economie'), theme('travail')],
  questions: ['q1', 'q2', 'q3'].map(question),
  axes: [],
  guide: GUIDE_SECTION_IDS.map(guideSection),
  corrections: [],
  legal: [],
  ...overrides,
});
