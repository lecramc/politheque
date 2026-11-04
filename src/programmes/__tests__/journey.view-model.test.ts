import { createTestStore } from '@/src/core/store/create-test-store';
import { FakeReadingProgressGateway } from '@/src/programmes/gateways/fake-reading-progress.gateway';
import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { journeyViewModel } from '@/src/programmes/view-models/journey.view-model';

const D = '2026-11-03T08:00:00.000Z';
const NOW = new Date('2026-11-04T10:00:00.000Z');

const ready = () => stateBuilder().withCatalog(catalogFactory()).withProgressStatus('ready');

const vmOf = (state = ready().build(), dependencies = {}) => {
  const store = createTestStore({ initialState: state, dependencies });
  const vm = journeyViewModel(NOW)({ dispatch: store.dispatch });
  return { store, vm: vm(store.getState()) };
};

describe('Feature: accueil en parcours', () => {
  it('should render a neutral state before progress is loaded (no next, no cta, ratios at 0)', () => {
    const { vm } = vmOf(
      stateBuilder()
        .withCatalog(catalogFactory())
        .withEntries({ 'guide:institutions': D, 'stamp:les-bases': D })
        .build()
    );
    expect(vm.hydrated).toBe(false);
    expect(vm.loaded).toBe(true);
    expect(vm.summary).toBeNull();
    expect(vm.finished).toBe(false);
    expect(vm.nodes.every((n) => n.ratio === 0 && n.status === 'todo' && !n.stamped)).toBe(true);
    expect(vm.nodes.every((n) => !n.isNext && n.cta === null)).toBe(true);
    expect(vm.nodes[1].meta).toBe('4 lectures');
  });

  it('should show the intro for a new visitor and the summary once a content is read', () => {
    expect(vmOf().vm.summary).toBeNull();
    const { vm } = vmOf(ready().withEntries({ 'guide:institutions': D }).build());
    expect(vm.summary).toMatchObject({
      stampedCount: 0,
      total: 6,
      label: '0 sur 6 étapes',
      next: { title: 'Les bases', href: '/parcours/les-bases', cta: 'Commencer' },
    });
  });

  it('should highlight the advised step with its call to action', () => {
    const { vm } = vmOf();
    expect(vm.nodes.filter((n) => n.isNext).map((n) => n.id)).toEqual(['les-bases']);
    expect(vm.nodes[0].cta).toBe('Commencer');
    expect(vm.nodes[0].accessibilityLabel).toContain('étape conseillée');
    expect(vm.nodes[1].cta).toBeNull();
  });

  it('should show progress, stamp and a solid segment for a finished step', () => {
    const { vm } = vmOf(
      ready()
        .withEntries({
          'guide:gauche-droite': D,
          'guide:classement-des-partis': D,
          'guide:desinformation': D,
          'stamp:les-bases': D,
        })
        .build()
    );
    expect(vm.nodes[0]).toMatchObject({ ratio: 1, stamped: true, segmentDone: true });
    expect(vm.nodes[0].meta).toBe('3 sur 3 lectures');
    expect(vm.nodes[1].isNext).toBe(true);
  });

  it('should list the contents of each step as chips with their read state', () => {
    const { vm } = vmOf(ready().withEntries({ 'party:alpha': D }).build());
    const parties = vm.nodes[2].chips;
    expect(parties.map((c) => [c.title, c.read])).toEqual([
      ['Zeta', false],
      ['Alpha', true],
      ['Milieu', false],
    ]);
  });

  it('should expose the featured election news with days left', () => {
    const { vm } = vmOf();
    expect(vm.news).toMatchObject({
      title: 'Élection présidentielle 2027',
      roundLabel: '1er tour',
      daysLeft: 165,
      href: '/elections/presidentielle-2027',
    });
    expect(vm.nodes[4].meta).toBe('3 lectures · J-165');
  });

  it('should have no news when no election is featured', () => {
    const catalog = catalogFactory({ elections: [electionFactory({ featured: false })] });
    const { vm } = vmOf(stateBuilder().withCatalog(catalog).withProgressStatus('ready').build());
    expect(vm.news).toBeNull();
  });

  it('should expose pending celebrations and clear them when shown', () => {
    const { vm, store } = vmOf(ready().withCelebrations(['les-bases']).build());
    expect(vm.celebrations).toEqual(['les-bases']);
    vm.celebrationsShown(['les-bases']);
    expect(store.getState().progress.celebrations).toEqual([]);
  });

  it('should clear the progression', async () => {
    const gateway = new FakeReadingProgressGateway();
    const { vm, store } = vmOf(ready().withEntries({ 'guide:institutions': D }).build(), {
      readingProgressGateway: gateway,
    });
    await vm.clearProgress();
    expect(gateway.cleared).toBe(true);
    expect(store.getState().progress.entries).toEqual({});
  });

  it('should give every step a link, even at zero progress', () => {
    const { vm } = vmOf();
    expect(vm.nodes.map((n) => n.href)).toEqual([
      '/parcours/les-bases',
      '/parcours/les-institutions',
      '/parcours/les-partis',
      '/parcours/les-grands-debats',
      '/parcours/presidentielle-2027',
      '/me-situer',
    ]);
  });

  it('should be finished once the six stamps are acquired', () => {
    const stamps = Object.fromEntries(
      [
        'les-bases',
        'les-institutions',
        'les-partis',
        'les-grands-debats',
        'presidentielle-2027',
        'me-situer',
      ].map((id) => [`stamp:${id}`, D])
    );
    const { vm } = vmOf(ready().withEntries(stamps).build());
    expect(vm.finished).toBe(true);
    expect(vm.passport).toMatchObject({ stampedCount: 6, total: 6, label: '6 tampons sur 6' });
  });
});
