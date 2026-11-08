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

describe('Feature: accueil à quatre tâches', () => {
  it('should offer the four tasks in a fixed order, each to its own page', () => {
    expect(vmOf().tasks.map((t) => [t.id, t.href])).toEqual([
      ['situer', '/me-situer'],
      ['partis', '/partis'],
      ['comparer', '/partis/comparer'],
      ['voter', '/elections/presidentielle-2027'],
    ]);
  });

  it('should word the questionnaire task from the real question count, and promise nothing is sent', () => {
    expect(vmOf().tasks[0].subtitle).toBe("3 affirmations · 5 min · rien n'est envoyé");
  });

  it('should word the vote task with the two dates a voter needs', () => {
    expect(vmOf().tasks[3].subtitle).toBe("1er tour le 18 avril · s'inscrire avant le 12 mars");
  });

  it('should drop the vote task when no election is featured', () => {
    const none = stateBuilder()
      .withCatalog(catalogFactory({ elections: [electionFactory({ featured: false })] }))
      .build();
    expect(vmOf(none).tasks.map((t) => t.id)).toEqual(['situer', 'partis', 'comparer']);
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
