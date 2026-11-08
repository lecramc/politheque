import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { comprendreViewModel } from '@/src/programmes/view-models/comprendre.view-model';

const D = '2026-11-03T08:00:00.000Z';
const catalog = catalogFactory({
  parties: Array.from({ length: 10 }, (_, i) => partyFactory({ id: `p${i}`, name: `P${i}` })),
});
const ready = () => stateBuilder().withCatalog(catalog).withProgressStatus('ready');
const vmOf = (state = ready().build()) => comprendreViewModel()(state);

describe('Feature: Comprendre avec le suivi de lecture', () => {
  it('should group the lessons in three chapters, in the order of the old path', () => {
    const { chapters } = vmOf();
    expect(chapters.map((c) => [c.id, c.number, c.title])).toEqual([
      ['les-bases', 1, 'Les bases'],
      ['les-institutions', 2, 'Les institutions'],
      ['presidentielle-2027', 3, 'La présidentielle 2027'],
    ]);
    expect(chapters[0].items.map((i) => i.href)).toEqual([
      '/comprendre/gauche-droite',
      '/comprendre/classement-des-partis',
      '/comprendre/desinformation',
    ]);
  });

  it('should tick the lessons read and count them over the nine lessons', () => {
    const vm = vmOf(
      ready().withEntries({ 'guide:gauche-droite': D, 'guide:institutions': D }).build()
    );
    expect(vm.chapters[0].items[0].read).toBe(true);
    expect(vm.chapters[0].items[1].read).toBe(false);
    expect(vm.reading).toMatchObject({ readCount: 2, total: 9, label: '2 sur 9', visible: true });
  });

  it('should show nothing read before the local progress is loaded, so the first render matches the static page', () => {
    const vm = vmOf(
      stateBuilder().withCatalog(catalog).withEntries({ 'guide:gauche-droite': D }).build()
    );
    expect(vm.chapters[0].items[0].read).toBe(false);
    expect(vm.reading).toMatchObject({ readCount: 0, label: '0 sur 9' });
  });

  it('should list what comes next: the ten sheets, the nine debates and the questionnaire', () => {
    const { then } = vmOf(ready().withEntries({ 'party:p0': D, 'party:p1': D }).build());
    expect(then.map((row) => [row.title, row.meta, row.href])).toEqual([
      ['Lire les fiches des dix partis', '2 sur 10', '/partis'],
      ['Parcourir les deux grands débats', '0 sur 2', '/partis#debats'],
      ['Me situer (3 affirmations)', '5 min', '/me-situer'],
    ]);
  });

  it('should link to « Ma progression » and say the reading stays on the device', () => {
    expect(vmOf().progressHref).toBe('/passeport');
  });
});
