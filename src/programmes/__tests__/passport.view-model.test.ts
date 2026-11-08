import { createTestStore } from '@/src/core/store/create-test-store';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { passportViewModel } from '@/src/programmes/view-models/passport.view-model';

const D = '2026-11-03T08:00:00.000Z';
const STEPS = [
  'les-bases',
  'les-institutions',
  'les-partis',
  'les-grands-debats',
  'presidentielle-2027',
  'me-situer',
];

const vmOf = (entries: Record<string, string> = {}, status: 'ready' | 'unknown' = 'ready') => {
  const store = createTestStore({
    initialState: stateBuilder()
      .withCatalog(catalogFactory())
      .withProgressStatus(status)
      .withEntries(entries)
      .build(),
  });
  return passportViewModel()({ dispatch: store.dispatch })(store.getState());
};

describe('Feature: passeport du citoyen', () => {
  it('should show six stamps, empty or stamped', () => {
    const vm = vmOf({ 'stamp:les-bases': D, 'stamp:me-situer': D });
    expect(vm.stamps.map((s) => s.stepId)).toEqual(STEPS);
    expect(vm.stamps.map((s) => s.state)).toEqual([
      'stamped',
      'empty',
      'empty',
      'empty',
      'empty',
      'stamped',
    ]);
    expect(vm.stampedCount).toBe(2);
    expect(vm.total).toBe(6);
  });

  it('should show the final message only when the six stamps are acquired', () => {
    expect(vmOf({ 'stamp:les-bases': D }).heading).toBe('Ma progression');
    expect(vmOf({ 'stamp:les-bases': D }).finished).toBe(false);
    const all = Object.fromEntries(STEPS.map((id) => [`stamp:${id}`, D]));
    const vm = vmOf(all);
    expect(vm.finished).toBe(true);
    expect(vm.heading).toBe('Vous êtes prêt·e à voter en connaissance de cause');
  });

  it('should list parties in the catalog order with their read state', () => {
    const vm = vmOf({ 'party:alpha': D });
    expect(vm.parties.items.map((i) => [i.title, i.state])).toEqual([
      ['Zeta', 'empty'],
      ['Alpha', 'stamped'],
      ['Milieu', 'empty'],
    ]);
    expect(vm.parties.countLabel).toBe('1 sur 3 fiches lues · ordre alphabétique');
    expect(vm.debates.countLabel).toBe('0 sur 2 débats lus');
  });

  it('should state that the quiz stamp never reflects the answers', () => {
    expect(vmOf().quizNote).toBe(
      'Le tampon « Me situer » indique que vous avez répondu au questionnaire, jamais ce que vous avez répondu.'
    );
  });

  it('should word the subtitle from the stamps, hidden before loading', () => {
    expect(vmOf({ 'stamp:les-bases': D }).subtitle).toBe('1 sur 6 étapes');
    expect(vmOf({}, 'unknown').subtitle).toBeNull();
    const all = Object.fromEntries(STEPS.map((id) => [`stamp:${id}`, D]));
    expect(vmOf(all).subtitle).toBe('Les 6 étapes sont terminées.');
  });

  it('should point to how to vote', () => {
    expect(vmOf().whatNow).toMatchObject({
      label: 'Comment voter',
      href: '/comprendre/comment-voter',
    });
  });

  it('should hide counts and stamps before progress is loaded', () => {
    const vm = vmOf({ 'stamp:les-bases': D, 'party:alpha': D }, 'unknown');
    expect(vm.hydrated).toBe(false);
    expect(vm.stamps.every((s) => s.state === 'empty')).toBe(true);
    expect(vm.parties.countLabel).toBeNull();
    expect(vm.stampedCount).toBe(0);
  });
});
