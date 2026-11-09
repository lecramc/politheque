import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import type { LexiconEntry } from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import {
  faqViewModel,
  lexiconViewModel,
  voterViewModel,
} from '@/src/programmes/view-models/contenus-2027.view-model';
import { electionViewModel } from '@/src/programmes/view-models/elections.view-model';

const source = (url: string) => ({
  title: 'Titre',
  url,
  date: '2026-11-08',
  kind: 'statistique' as const,
});
const entry = (id: string, term: string, related: string[] = []): LexiconEntry => ({
  id,
  term,
  definition: `Définition ${term}`,
  more: [],
  related,
  sources: [source(`https://example.gouv.fr/${id}`)],
  lastVerified: '2026-11-08',
});

const loaded = (overrides = {}) => stateBuilder().withCatalog(catalogFactory(overrides)).build();

describe('Feature: view-model du lexique', () => {
  it('should be loading, without meta, before the catalog is loaded', () => {
    const vm = lexiconViewModel()(stateBuilder().build());
    expect(vm).toMatchObject({ status: 'idle', meta: null, groups: [], count: 0 });
  });

  it('should group the terms alphabetically and resolve related lessons', () => {
    const vm = lexiconViewModel()(
      loaded({
        lexicon: [entry('b', 'Budget', ['institutions']), entry('a', 'Article', ['inconnue'])],
      })
    );
    expect(vm.count).toBe(2);
    expect(vm.groups.map((g) => g.letter)).toEqual(['A', 'B']);
    expect(vm.groups[1].items[0].lessons).toEqual([
      { id: 'institutions', title: 'Section institutions', href: '/comprendre/institutions' },
    ]);
    expect(vm.groups[0].items[0].lessons).toEqual([]);
  });

  it('should gather every source once for the page source list and expose the latest check', () => {
    const vm = lexiconViewModel()(loaded({ lexicon: [entry('a', 'A'), entry('b', 'B')] }));
    expect(vm.allSources).toHaveLength(2);
    expect(vm.verifiedOn).toBe('2026-11-08');
  });
});

describe('Feature: view-model de la FAQ', () => {
  const real = stateBuilder().withCatalog(buildStaticCatalog()).build();

  it('should expose a plain-language note for each calculated date', () => {
    const vm = faqViewModel()(real);
    const item = vm.items.find((i) => i.entry.id === 'decret-de-convocation')!;
    expect(item.calculated).toEqual([
      expect.objectContaining({ text: 'dimanche 7 février 2027', rule: expect.any(String) }),
    ]);
    expect(vm.items.find((i) => i.entry.id === 'quand-vote-t-on')!.calculated).toEqual([]);
  });

  it('should link to the election page and the voting page', () => {
    const vm = faqViewModel()(real);
    expect(vm.electionHref).toBe('/elections/presidentielle-2027');
    expect(vm.voterHref).toBe('/elections/presidentielle-2027/voter');
    expect(vm.meta?.path).toBe('/elections/presidentielle-2027/questions');
  });
});

describe('Feature: view-model de la page « Comment voter »', () => {
  const real = stateBuilder().withCatalog(buildStaticCatalog()).build();

  it('should expose every section with its calculated dates, and the matching lesson', () => {
    const vm = voterViewModel()(real);
    expect(vm.sections).toHaveLength(7);
    expect(vm.sections[0].calculated.map((c) => c.text)).toEqual([
      'vendredi 12 mars 2027',
      'jeudi 8 avril 2027',
    ]);
    expect(vm.lesson).toMatchObject({ id: 'comment-voter', href: '/comprendre/comment-voter' });
  });

  it('should list the sources of the summary and of every section', () => {
    const vm = voterViewModel()(real);
    expect(vm.allSources.length).toBeGreaterThan(vm.sections.length);
  });
});

describe('Feature: liens de la page élection vers les contenus 2027', () => {
  const vmOf = (electionId: string) =>
    electionViewModel(electionId)({ dispatch: vi.fn() })(
      stateBuilder()
        .withCatalog(
          catalogFactory({ elections: [electionFactory({ id: electionId, featured: true })] })
        )
        .build()
    );

  it('should point to the voting page and the FAQ for the presidential election', () => {
    expect(vmOf('presidentielle-2027').contentLinks).toEqual({
      voter: '/elections/presidentielle-2027/voter',
      faq: '/elections/presidentielle-2027/questions',
    });
  });

  it('should offer no such links for another election', () => {
    expect(vmOf('municipales-2026').contentLinks).toBeNull();
  });
});
