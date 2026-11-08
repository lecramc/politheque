import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type {
  Candidacy,
  Catalog,
  KeyIdea,
  Party,
  ProgrammeState,
  Question,
  Source,
  ThemeId,
} from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

const ELECTION = 'presidentielle-2027';
const THEME_IDS: ThemeId[] = ['economie', 'travail', 'immigration', 'securite'];

const programme: Source = {
  title: 'Programme',
  url: 'https://parti.fr/p',
  date: '2022-03',
  kind: 'programme',
};
const press: Source = {
  title: 'Article',
  url: 'https://journal.fr/a',
  date: '2026-10-06',
  kind: 'presse',
};
const vote: Source = {
  title: 'Scrutin',
  url: 'https://assemblee.fr/s',
  date: '2026-01-12',
  kind: 'vote',
};

const question = (id: string, theme: ThemeId, shortLabel: string): Question => ({
  id,
  theme,
  statement: `Affirmation ${id}`,
  shortLabel,
  help: '',
  axis: null,
  direction: 1,
});

const questions = [
  question('q1', 'economie', 'Impôt minimum'),
  question('q2', 'economie', 'Deuxième économie'),
  question('q3', 'travail', 'Retraite à 62 ans'),
];

const keyIdeas = (id: string): KeyIdea[] =>
  // Ordre éditorial volontairement différent de l'ordre des thèmes du site.
  [...THEME_IDS].reverse().map((theme) => ({
    id: `${id}-${theme}`,
    title: `Idée ${theme}`,
    text: `Texte ${theme}.`,
    measureRefs: [`${theme}.0`],
    relatedQuestionIds: theme === 'economie' ? ['q1'] : [],
  }));

const partyOf = (id: string, name: string, state: ProgrammeState = 'non-publie'): Party => {
  const themes = emptyThemes();
  for (const theme of THEME_IDS) {
    themes[theme].measures = [{ text: 'Mesure', sources: [programme, press] }];
  }
  const candidacy: Candidacy = {
    candidateName: 'Jeanne Dupont',
    status: 'declare',
    statusLabel: 'Candidate déclarée',
    candidate: '',
    programmeStatus: '',
    programmeState: state,
    ...(state === 'partiel' ? { programmeStateDetail: '96 mesures' } : {}),
    themes,
  };
  return partyFactory({
    id,
    name,
    foundedYear: 1972,
    leader: { name: 'Jordan Bardella', role: 'présidé par' },
    lastVerified: '2026-11-03',
    family: 'Extrême droite (presse de référence)',
    keyIdeas: keyIdeas(id),
    history: {
      founded: '1972',
      origins: { text: '', sources: [] },
      ideals: [
        { title: 'Ce que dit le parti', text: '', sources: [] },
        { title: 'Classement par la presse', text: '', sources: [] },
      ],
      timeline: [
        { date: '1972', event: 'Fondation', sources: [] },
        { date: '2018', event: 'Changement de nom', sources: [] },
      ],
    },
    stanceValues: { q1: 2, q2: 1, q3: -2 },
    candidacies: { [ELECTION]: candidacy },
  });
};

const withStanceSources = (party: Party): Party => ({
  ...party,
  stances: {
    ...party.stances,
    q1: { stance: 2, justification: 'Parce que.', sources: [vote] },
  },
});

const catalogOf = (parties: Party[]): Catalog =>
  catalogFactory({
    parties,
    questions,
    themes: THEME_IDS.map((id) => ({
      id,
      title: `Titre ${id}`,
      icon: 'x',
      context: '',
      keyFigures: [],
      debates: [],
    })),
  });

const vmOf = (catalog: Catalog, id: string) =>
  partyViewModel(id)({ dispatch: vi.fn() })(stateBuilder().withCatalog(catalog).build());

const journalEntry = (date: string, page: string): CorrectionEntry => ({
  id: `${date}-${page}`,
  date,
  kind: 'correction',
  pages: [page],
  summary: 'Résumé de la correction publiée au journal.',
});

const complete = catalogOf([partyOf('alpha', 'Alpha'), withStanceSources(partyOf('beta', 'Beta'))]);

describe('Feature: identité en tête de fiche', () => {
  it('should read « Fondé en {année} · {rôle} {dirigeant} » with the role from the data', () => {
    expect(vmOf(complete, 'alpha').identityLine).toBe(
      'Fondé en 1972 · présidé par Jordan Bardella'
    );
  });

  it('should write the verification date in words', () => {
    expect(vmOf(complete, 'alpha').verifiedOn).toBe('3 novembre 2026');
  });

  it('should not show an update date when the journal has nothing newer than the verification', () => {
    expect(vmOf(complete, 'alpha').updatedOn).toBeNull();
    const sameDay = { ...complete, corrections: [journalEntry('2026-11-03', '/partis/alpha')] };
    expect(vmOf(sameDay, 'alpha').updatedOn).toBeNull();
  });

  it('should show the date of the latest journal entry touching the party when it is newer', () => {
    const catalog = {
      ...complete,
      corrections: [
        journalEntry('2026-11-05', '/partis/beta'),
        journalEntry('2026-11-04', '/partis/alpha/histoire'),
      ],
    };
    expect(vmOf(catalog, 'alpha').updatedOn).toBe('4 novembre 2026');
    expect(vmOf(catalog, 'alpha').verifiedOn).toBe('3 novembre 2026');
  });
});

describe('Feature: « Ce qu’il propose »', () => {
  it('should sort the ideas in the fixed order of the site themes', () => {
    const vm = vmOf(complete, 'alpha');
    expect(vm.keyIdeas?.items.map((i) => i.themeTitle)).toEqual([
      'Titre economie',
      'Titre travail',
      'Titre immigration',
      'Titre securite',
    ]);
  });

  it('should state the origin of an idea from its measures, with the number of sources', () => {
    const [first] = vmOf(complete, 'alpha').keyIdeas!.items;
    expect(first).toMatchObject({
      title: 'Idée economie',
      text: 'Texte economie.',
      origin: 'Programme, mars 2022',
      sourceCount: 2,
      sourceCountLabel: '2 sources',
    });
  });

  it('should list the sources of the related questions in the sources of the idea', () => {
    const [first] = vmOf(complete, 'beta').keyIdeas!.items;
    expect(first.sourceCount).toBe(3);
    expect(first.sources.map((s) => s.url)).toContain(vote.url);
    expect(first.relatedStances).toEqual([{ questionId: 'q1', label: 'Impôt minimum', stance: 2 }]);
  });

  it('should show the section for none of the parties when one idea is below the threshold', () => {
    const weak = partyOf('beta', 'Beta');
    weak.candidacies[ELECTION].themes.economie.measures = [{ text: 'M', sources: [programme] }];
    const catalog = catalogOf([partyOf('alpha', 'Alpha'), weak]);
    expect(vmOf(catalog, 'alpha').keyIdeas).toBeNull();
    expect(vmOf(catalog, 'beta').keyIdeas).toBeNull();
  });

  it.each([
    ['non-publie', 'Programme 2027 pas encore publié au 3 novembre 2026.'],
    ['partiel', 'Programme 2027 partiel (96 mesures) au 3 novembre 2026.'],
    ['publie', null],
  ] as const)('should phrase the programme state « %s » in one line', (state, line) => {
    const catalog = catalogOf([partyOf('alpha', 'Alpha', state)]);
    expect(vmOf(catalog, 'alpha').keyIdeas?.programmeLine).toBe(line);
  });
});

describe('Feature: Pour ou contre ?', () => {
  it('should list the same great questions, in the order of the questionnaire', () => {
    const a = vmOf(complete, 'alpha').glance.map((g) => g.questionId);
    const b = vmOf(complete, 'beta').glance.map((g) => g.questionId);
    expect(a).toEqual(['q1', 'q3']);
    expect(b).toEqual(a);
  });

  it('should give each line its short label, stance, justification and sources', () => {
    expect(vmOf(complete, 'beta').glance[0]).toMatchObject({
      label: 'Impôt minimum',
      stance: 2,
      statement: 'Affirmation q1',
      justification: 'Parce que.',
      sources: [vote],
    });
  });

  it('should link each line to the comparison of its debate, with this party preselected', () => {
    const theme = vmOf(complete, 'beta').stances[0].question.theme;
    expect(vmOf(complete, 'beta').glance[0].compareHref).toBe(`/debats/${theme}?comparer=beta`);
    expect(vmOf(complete, 'alpha').glance[0].compareHref).toBe(`/debats/${theme}?comparer=alpha`);
  });
});

describe('Feature: bas de fiche', () => {
  it('should offer the next sheet in alphabetical order', () => {
    expect(vmOf(complete, 'alpha').nextParty).toMatchObject({ id: 'beta', name: 'Beta' });
    expect(vmOf(complete, 'beta').nextParty).toMatchObject({ id: 'alpha', name: 'Alpha' });
  });
});

describe('Feature: pour aller plus loin', () => {
  it('should only link the definition, the other sections being tabs of the same sheet', () => {
    expect(vmOf(complete, 'alpha').further).toEqual([
      {
        key: 'definition',
        title: 'Comment il se définit, comment on le classe',
        subtitle: null,
        href: '/partis/alpha/histoire',
      },
    ]);
  });

  it('should not promise a self-definition when the party has no such ideal', () => {
    const noSelfDefinition = catalogOf([
      {
        ...partyOf('alpha', 'Alpha'),
        history: {
          ...partyOf('alpha', 'Alpha').history!,
          ideals: [{ title: 'Classement par la presse', text: '', sources: [] }],
        },
      },
      withStanceSources(partyOf('beta', 'Beta')),
    ]);
    expect(vmOf(noSelfDefinition, 'alpha').further[0]).toMatchObject({
      key: 'definition',
      title: 'Comment on le classe',
    });
  });

  it('should word the great questions block from the real counts', () => {
    const vm = vmOf(complete, 'alpha');
    expect(vm.glanceIntro).toBe(
      '2 questions, les mêmes pour les 2 partis. Touchez-en une pour voir pourquoi et les sources.'
    );
    expect(vm.positionsLabel).toBe('Voir les 3 positions');
  });
});
