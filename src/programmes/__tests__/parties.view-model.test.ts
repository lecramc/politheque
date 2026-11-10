import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partiesViewModel } from '@/src/programmes/view-models/parties.view-model';

const catalog = catalogFactory({
  parties: [
    partyFactory({ id: 'zeta', name: 'Zeta' }),
    partyFactory({ id: 'alpha', name: 'Alpha' }),
  ],
});
const vm = () => partiesViewModel()(stateBuilder().withCatalog(catalog).build());

describe('Feature: hub Partis (fiches, comparaison et grands débats)', () => {
  it('should list the parties in alphabetical order, whatever the catalog order', () => {
    expect(vm().parties.map((p) => p.id)).toEqual(['alpha', 'zeta']);
  });

  it('should list every debate in the order of the catalog, each at its own address', () => {
    expect(vm().debates.map((d) => [d.id, d.href])).toEqual([
      ['economie', '/debats/economie'],
      ['travail', '/debats/travail'],
    ]);
  });

  it('should open the compare tool without any pair chosen', () => {
    expect(vm().compareHref).toBe('/partis/comparer');
  });

  it('should give an access to the full list of candidates, near « Comparer deux partis »', () => {
    const withCandidates = catalogFactory({
      candidates: {
        ...catalog.candidates,
        candidates: ['a', 'b', 'c'].map((id) => ({
          id,
          name: `Candidat ${id}`,
          status: 'declare' as const,
          statusLabel: 'Candidature déclarée',
          date: '2026-05-01',
          affiliation: 'Sans étiquette',
          role: '',
          summary: '',
          sources: [],
        })),
      },
    });
    const state = stateBuilder().withCatalog(withCandidates).build();
    expect(partiesViewModel()(state).candidatesEntry).toMatchObject({
      href: '/elections/presidentielle-2027/candidats',
      label: 'Présidentielle 2027 : les 3 candidatures',
    });
  });

  it('should expose the other parties with a candidate and the common sentence', () => {
    expect(vm().otherParties).toEqual([]);
    expect(vm().otherPartiesNote).toBe(
      "Ces partis n'ont pas encore de fiche détaillée sur Polithèque (programme et positions)."
    );
  });
});
