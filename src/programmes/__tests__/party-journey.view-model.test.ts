import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyJourneyViewModel } from '@/src/programmes/view-models/party-journey.view-model';

const D = '2026-11-03T08:00:00.000Z';

const catalog = catalogFactory({
  parties: [
    partyFactory({ id: 'alpha', name: 'Alpha' }),
    partyFactory({ id: 'beta', name: 'Beta' }),
  ],
});

const vmOf = (
  entries: Record<string, string> = {},
  status: 'ready' | 'unknown' = 'ready',
  partyId = 'alpha'
) =>
  partyJourneyViewModel(partyId)()(
    stateBuilder().withCatalog(catalog).withProgressStatus(status).withEntries(entries).build()
  );

describe('Feature: bloc parcours en bas de fiche', () => {
  it('should be neutral before the local progress is loaded, whatever is stored', () => {
    const vm = vmOf({ 'party:alpha': D }, 'unknown');
    expect(vm).toMatchObject({
      hydrated: false,
      heading: 'Parcours · étape 3 : les partis',
      countLabel: null,
      ratio: 0,
      title: null,
      stamp: 'empty',
      text: 'Le tampon se pose quand vous arrivez ici ou ouvrez « Positions ».',
      completion: null,
    });
  });

  it('should tell that the sheet is not read yet and how many are read', () => {
    const vm = vmOf({ 'party:beta': D });
    expect(vm).toMatchObject({
      hydrated: true,
      countLabel: '1 fiche lue sur 2',
      ratio: 0.5,
      title: 'Pas encore lue.',
      stamp: 'empty',
      text: 'Le tampon se pose quand vous arrivez ici ou ouvrez « Positions ».',
      completion: null,
    });
  });

  it('should stamp the sheet once read', () => {
    const vm = vmOf({ 'party:alpha': D });
    expect(vm).toMatchObject({ title: 'Fiche lue.', stamp: 'stamped', text: null });
    expect(vm.countLabel).toBe('1 fiche lue sur 2');
  });

  it('should offer the next step when the ten sheets are read, and say nothing is sent', () => {
    const vm = vmOf({ 'party:alpha': D, 'party:beta': D });
    expect(vm.countLabel).toBe('2 fiches lues sur 2');
    expect(vm.completion).toEqual({
      text: "Les 2 fiches sont lues : l'étape « Les partis » est terminée.",
      nextLabel: 'Étape suivante : les grands débats',
      nextHref: '/parcours/les-grands-debats',
      privacy: "Rien n'est envoyé : la progression reste sur cet appareil.",
    });
  });
});
