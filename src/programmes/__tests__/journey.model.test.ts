import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import {
  buildJourney,
  hrefOf,
  JOURNEY_STEP_IDS,
  stepHref,
} from '@/src/programmes/models/journey.model';
import { contentKey } from '@/src/programmes/models/reading-progress.model';

const stepOf = (id: (typeof JOURNEY_STEP_IDS)[number], catalog = catalogFactory()) =>
  buildJourney(catalog).find((s) => s.id === id)!;

describe('Feature: définition du parcours', () => {
  it('should define six steps in the advised order', () => {
    expect(buildJourney(catalogFactory()).map((s) => s.id)).toEqual([
      'les-bases',
      'les-institutions',
      'les-partis',
      'les-grands-debats',
      'presidentielle-2027',
      'me-situer',
    ]);
    expect(buildJourney(catalogFactory()).map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should put every guide section of the step, in order', () => {
    expect(stepOf('les-bases').items.map((i) => i.key)).toEqual([
      'guide:gauche-droite',
      'guide:classement-des-partis',
      'guide:desinformation',
    ]);
    expect(stepOf('les-institutions').items.map((i) => i.key)).toEqual([
      'guide:institutions',
      'guide:pouvoirs-du-president',
      'guide:union-europeenne',
      'guide:budget-dette',
    ]);
  });

  it('should put every party of the catalog in the parties step, in catalog order', () => {
    const items = stepOf('les-partis').items;
    expect(items.map((i) => i.key)).toEqual(['party:zeta', 'party:alpha', 'party:milieu']);
    expect(items.map((i) => i.title)).toEqual(['Zeta', 'Alpha', 'Milieu']);
    expect(items[0].partyColor).toBe('#888888');
  });

  it('should put every theme in the debates step, in catalog order', () => {
    expect(stepOf('les-grands-debats').items.map((i) => i.key)).toEqual([
      'debate:economie',
      'debate:travail',
    ]);
  });

  it('should add the featured election to the presidential step', () => {
    expect(stepOf('presidentielle-2027').items.map((i) => i.key)).toEqual([
      'guide:election-presidentielle',
      'guide:comment-voter',
      'election:presidentielle-2027',
    ]);
    expect(stepOf('presidentielle-2027').items[2].title).toBe('Les candidatures 2027');
  });

  it('should drop the election item when no election is featured', () => {
    const catalog = catalogFactory({ elections: [electionFactory({ featured: false })] });
    expect(stepOf('presidentielle-2027', catalog).items.map((i) => i.kind)).toEqual([
      'guide',
      'guide',
    ]);
  });

  it('should link a single-content step directly to its content', () => {
    expect(stepHref(stepOf('me-situer'))).toBe('/me-situer');
    expect(stepHref(stepOf('les-partis'))).toBe('/parcours/les-partis');
  });

  it('should build canonical hrefs from content keys', () => {
    expect(hrefOf(contentKey.guide('institutions'))).toBe('/comprendre/institutions');
    expect(hrefOf(contentKey.party('lfi'))).toBe('/partis/lfi');
    expect(hrefOf(contentKey.debate('economie'))).toBe('/debats/economie');
    expect(hrefOf(contentKey.election('presidentielle-2027'))).toBe(
      '/elections/presidentielle-2027'
    );
    expect(hrefOf(contentKey.quizDone)).toBe('/me-situer');
  });

  it('should skip guide sections missing from the catalog', () => {
    const catalog = catalogFactory({ guide: [] });
    expect(stepOf('les-bases', catalog).items).toEqual([]);
  });
});
