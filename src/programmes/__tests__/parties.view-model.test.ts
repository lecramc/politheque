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
});
