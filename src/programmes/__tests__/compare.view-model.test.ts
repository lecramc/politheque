import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { compareViewModel } from '@/src/programmes/view-models/compare.view-model';

const catalog = catalogFactory({
  parties: [
    partyFactory({ id: 'zeta', name: 'Zeta' }),
    partyFactory({ id: 'alpha', name: 'Alpha' }),
  ],
});
const vm = () => compareViewModel()(stateBuilder().withCatalog(catalog).build());

describe('Feature: écran « Comparer deux partis »', () => {
  it('should offer the parties in alphabetical order as the only choices', () => {
    expect(vm().options.map((o) => o.id)).toEqual(['alpha', 'zeta']);
  });

  it('should have no pair by default: nothing is compared until two parties are chosen', () => {
    expect(vm().compare(null, null)).toBeNull();
    expect(vm().compare('alpha', null)).toBeNull();
  });

  it('should compare the two chosen parties in the order of choice', () => {
    const result = vm().compare('zeta', 'alpha');
    expect(result?.parties.map((p) => p.id)).toEqual(['zeta', 'alpha']);
  });

  it('should open on a noindex page (thin content) whose canonical has no query', () => {
    expect(vm().meta?.path).toBe('/partis/comparer');
    expect(vm().meta?.robots).toBe('noindex, follow');
  });

  it('should write the link of a chosen pair with a, then b', () => {
    expect(vm().linkFor('rn', 'lfi')).toBe('/partis/comparer?a=rn&b=lfi');
    expect(vm().linkFor('rn', null)).toBe('/partis/comparer?a=rn');
    expect(vm().linkFor(null, null)).toBe('/partis/comparer');
  });
});
