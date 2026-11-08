import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { journeyStepViewModel } from '@/src/programmes/view-models/journey-step.view-model';

const D = '2026-11-03T08:00:00.000Z';

const vmOf = (
  stepId: string,
  entries: Record<string, string> = {},
  status: 'ready' | 'unknown' = 'ready'
) =>
  journeyStepViewModel(stepId)()(
    stateBuilder()
      .withCatalog(catalogFactory())
      .withProgressStatus(status)
      .withEntries(entries)
      .build()
  );

describe("Feature: page d'étape", () => {
  it('should list the step contents with "Fiche lue" / "À découvrir"', () => {
    const vm = vmOf('les-partis', { 'party:alpha': D });
    expect(vm.found).toBe(true);
    expect(vm.title).toBe('Les partis');
    expect(vm.index).toBe(3);
    expect(vm.total).toBe(6);
    expect(vm.readCount).toBe(1);
    expect(vm.itemTotal).toBe(3);
    expect(vm.items.map((i) => [i.title, i.statusLabel, i.stamp.state])).toEqual([
      ['Zeta', 'À découvrir', 'empty'],
      ['Alpha', 'Fiche lue', 'stamped'],
      ['Milieu', 'À découvrir', 'empty'],
    ]);
    expect(vm.items[0].href).toBe('/partis/zeta');
    expect(vm.orderNote).toBe('Ordre alphabétique');
    expect(vm.footnote).toBe(
      "Le tampon de l'étape s'obtient avec les 3 fiches. Rien n'est bloqué en attendant."
    );
  });

  it('should invite to read the remaining parties without reference to answers', () => {
    expect(vmOf('les-partis', { 'party:alpha': D }).invite).toMatch(/^Encore 2 fiches à découvrir/);
    expect(vmOf('les-bases').invite).toBeNull();
    expect(vmOf('les-partis').orderNote).not.toBeNull();
    expect(vmOf('les-bases').orderNote).toBeNull();
  });

  it('should suggest the next unread content in step order for parties', () => {
    const vm = vmOf('les-partis', { 'party:zeta': D });
    expect(vm.nextItem).toEqual({
      title: 'Alpha',
      href: '/partis/alpha',
      label: 'Fiche suivante (ordre alphabétique) : Alpha',
    });
    expect(
      vmOf('les-partis', { 'party:zeta': D, 'party:alpha': D, 'party:milieu': D }).nextItem
    ).toBeNull();
  });

  it('should suggest the next unread guide section for other steps', () => {
    expect(vmOf('les-bases', { 'guide:gauche-droite': D }).nextItem?.label).toBe(
      'Suite : Section classement-des-partis'
    );
  });

  it('should report an unknown step as not found', () => {
    expect(vmOf('nope').found).toBe(false);
  });

  it('should show an untouched step before progress is loaded', () => {
    const vm = vmOf('les-partis', { 'party:alpha': D }, 'unknown');
    expect(vm.hydrated).toBe(false);
    expect(vm.readCount).toBe(0);
    expect(vm.items.every((i) => i.stamp.state === 'empty')).toBe(true);
  });

  it('should say the answers are not kept when the questionnaire stamp exists without answers', () => {
    const vm = vmOf('me-situer', { 'quiz:done': D });
    expect(vm.notice).toBe(
      'Vos réponses ne sont pas conservées : refaites le questionnaire ou ouvrez votre lien de résultats.'
    );
  });

  it('should show no notice before the questionnaire is done, nor on another step', () => {
    expect(vmOf('me-situer').notice).toBeNull();
    expect(vmOf('les-partis', { 'quiz:done': D }).notice).toBeNull();
  });
});
