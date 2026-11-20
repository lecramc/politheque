import {
  groupeFactory,
  indexFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { homeViewModel } from '@/src/programmes/view-models/home.view-model';

const election = electionFactory({
  rounds: [{ label: '1er tour', date: '2027-04-18', sources: [] }],
  keyDates: [
    {
      label: "Date limite d'inscription sur les listes électorales",
      date: '2027-03-12',
      sources: [],
    },
  ],
});
const catalog = catalogFactory({
  elections: [election],
  parties: [
    partyFactory({ id: 'zeta', name: 'Zeta' }),
    partyFactory({ id: 'alpha', name: 'Alpha' }),
    partyFactory({ id: 'milieu', name: 'Milieu' }),
  ],
});
const vmOf = (state = stateBuilder().withCatalog(catalog).build()) => homeViewModel()(state);

describe("Feature: accueil à cinq points d'entrée", () => {
  it('should offer the four rubriques then the vote, in the navigation order, each to its own page', () => {
    expect(vmOf().tasks.map((t) => [t.id, t.href])).toEqual([
      ['comprendre', '/comprendre'],
      ['partis', '/partis'],
      ['assemblee', '/assemblee'],
      ['situer', '/me-situer'],
      ['voter', '/elections/presidentielle-2027/voter'],
    ]);
  });

  it('should give every entry a rubrique, an action title, a line and an icon', () => {
    for (const task of vmOf().tasks) {
      expect(task.kicker).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.subtitle).toBeTruthy();
      expect(task.icon).toMatch(/-outline$/);
    }
  });

  it('should highlight no entry over the others', () => {
    expect(vmOf().tasks.some((t) => t.primary)).toBe(false);
  });

  it('should word the questionnaire task from the real question count, and promise nothing is sent', () => {
    const situer = vmOf().tasks.find((t) => t.id === 'situer');
    expect(situer?.subtitle).toBe("3 affirmations · 5 min · rien n'est envoyé");
  });

  it('should word the vote task with the two dates a voter needs', () => {
    const voter = vmOf().tasks.find((t) => t.id === 'voter');
    expect(voter?.subtitle).toBe("1er tour le 18 avril · s'inscrire jusqu'au 12 mars");
  });

  it('should drop the vote task when no election is featured', () => {
    const none = stateBuilder()
      .withCatalog(catalogFactory({ elections: [electionFactory({ featured: false })] }))
      .build();
    expect(vmOf(none).tasks.map((t) => t.id)).toEqual([
      'comprendre',
      'partis',
      'assemblee',
      'situer',
    ]);
  });
});

describe('Feature: accès à la liste des candidats depuis la tâche « Voter en 2027 »', () => {
  it('should offer the full list of candidates next to the vote task, with its count', () => {
    const withCandidate = catalogFactory({ elections: [election] });
    withCandidate.candidates.candidates.push({
      id: 'jean',
      name: 'Jean Dupont',
      status: 'declare',
      statusLabel: 'Candidature déclarée',
      date: '2026-05-01',
      affiliation: 'Sans étiquette',
      role: '',
      summary: '',
      sources: [],
      programme: { state: 'non-publie' },
    });
    expect(vmOf(stateBuilder().withCatalog(withCandidate).build()).candidatesLink).toEqual({
      href: '/elections/presidentielle-2027/candidats',
      label: 'Présidentielle 2027 : 1 candidature',
      subtitle: 'Qui se présente, programme, sources',
    });
  });

  it('should offer it only when an election is featured', () => {
    const none = stateBuilder()
      .withCatalog(catalogFactory({ elections: [electionFactory({ featured: false })] }))
      .build();
    expect(vmOf(none).candidatesLink).toBeNull();
  });
});

describe('Feature: les partis en accès direct', () => {
  it('should list every party in alphabetical order, with the same link shape', () => {
    expect(vmOf().parties.map((p) => [p.name, p.href])).toEqual([
      ['Alpha', '/partis/alpha/programme-2027'],
      ['Milieu', '/partis/milieu/programme-2027'],
      ['Zeta', '/partis/zeta/programme-2027'],
    ]);
  });

  it('should list nothing before the catalog is loaded', () => {
    expect(vmOf(stateBuilder().build()).parties).toEqual([]);
  });
});

describe('Feature: carte « Le parcours »', () => {
  it('should invite to start with the first step, whatever was read before loading', () => {
    const before = stateBuilder()
      .withCatalog(catalog)
      .withEntries({ 'guide:institutions': '2026-11-03T08:00:00.000Z' })
      .build();
    expect(vmOf(before).journey).toMatchObject({
      href: '/comprendre#les-bases',
      cta: 'Commencer : les bases (3 leçons)',
    });
  });

  it('should continue with the next unfinished step once progress is loaded', () => {
    const started = stateBuilder()
      .withCatalog(catalog)
      .withProgressStatus('ready')
      .withEntries({
        'guide:gauche-droite': '2026-11-03T08:00:00.000Z',
        'guide:classement-des-partis': '2026-11-03T08:00:00.000Z',
        'guide:desinformation': '2026-11-03T08:00:00.000Z',
      })
      .build();
    expect(vmOf(started).journey).toMatchObject({
      href: '/comprendre#les-institutions',
      cta: 'Continuer : les institutions',
    });
  });
});

describe("Feature: bandeau « dernier grand vote à l'Assemblée »", () => {
  const groupes = [
    groupeFactory({ organeRef: 'PO1', abrev: 'DX', libelle: 'Droite', medianePlace: 100 }),
    groupeFactory({ organeRef: 'PO2', abrev: 'GA', libelle: 'Gauche', medianePlace: 500 }),
  ];
  const withVotes = (scrutins: ReturnType<typeof scrutinFactory>[]) =>
    assembleeStateBuilder(stateBuilder().withCatalog(catalog).build())
      .withIndex(indexFactory({ groupes, scrutins }))
      .build();

  it('should have no banner without Assemblée data or without a major vote', () => {
    expect(vmOf().latestVote).toBeNull();
    expect(vmOf(withVotes([scrutinFactory({ categorie: 'resolution' })])).latestVote).toBeNull();
  });

  it('should show the most recent major vote, ignoring other kinds of votes', () => {
    const state = withVotes([
      scrutinFactory({ numero: 1, date: '2026-10-01', adopte: false }),
      scrutinFactory({
        numero: 2,
        date: '2026-11-10',
        adopte: true,
        groupes: [
          [0, 20, 15, 0, 0, 0],
          [1, 20, 0, 15, 0, 0],
        ],
      }),
      scrutinFactory({ numero: 3, date: '2026-11-15', categorie: 'resolution' }),
    ]);
    const { latestVote } = vmOf(state);
    expect(latestVote?.grid.columns.map((c) => [c.numero, c.resultat])).toEqual([[2, 'Adopté']]);
    expect(latestVote?.grid.rows.map((r) => r.abrev).sort()).toEqual(['DX', 'GA']);
  });

  it('should state the rule and link to the vote, to all votes and to the lesson', () => {
    const { latestVote } = vmOf(withVotes([scrutinFactory({ numero: 7 })]));
    expect(latestVote).toMatchObject({
      title: "Dernier grand vote à l'Assemblée",
      vote: { label: 'Voir le détail du vote', href: '/assemblee/scrutins/7' },
      allVotes: { label: 'Tous les votes', href: '/assemblee' },
      law: { label: 'Comment une loi est votée', href: '/comprendre/comment-une-loi-est-votee' },
    });
    expect(latestVote?.method).toMatch(/^Le plus récent des grands votes/);
  });

  it('should no longer offer a separate card to the Assemblée', () => {
    expect(vmOf()).not.toHaveProperty('assembleeLink');
  });
});
