import { citingParties, otherVotesOnSameText } from '@/src/assemblee/models/scrutin-links';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { PartyStance } from '@/src/programmes/models/programme.model';

const stance = (url: string): PartyStance =>
  ({
    stance: 'pour',
    justification: '',
    sources: [{ title: 'Scrutin', url, date: '2025-01-22', kind: 'vote' }],
  }) as unknown as PartyStance;

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'zeta',
      name: 'Zeta',
      stances: { q1: stance('https://www.assemblee-nationale.fr/dyn/17/scrutins/580') },
    }),
    partyFactory({
      id: 'alpha',
      name: 'Alpha',
      stances: {
        q1: stance('https://www.assemblee-nationale.fr/dyn/17/scrutins/580'),
        q2: stance('https://www.assemblee-nationale.fr/dyn/17/scrutins/5800'),
      },
    }),
    partyFactory({ id: 'beta', name: 'Beta', stances: {} }),
  ],
});

describe('Feature: autres votes sur ce texte', () => {
  const dossier = { uid: 'DL1', url: 'https://example.test/DL1' };
  const scrutins = [
    scrutinFactory({ numero: 1, date: '2025-02-01', dossier }),
    scrutinFactory({ numero: 2, date: '2025-03-01', dossier }),
    scrutinFactory({ numero: 3, date: '2025-04-01', dossier: { ...dossier, uid: 'DL2' } }),
    scrutinFactory({ numero: 4, date: '2025-05-01', dossier: null }),
  ];

  it('should list the other scrutins of the same official dossier, oldest first', () => {
    expect(otherVotesOnSameText(scrutins[1], scrutins).map((s) => s.numero)).toEqual([1]);
    expect(otherVotesOnSameText(scrutins[0], scrutins).map((s) => s.numero)).toEqual([2]);
  });

  it('should never group by similar titles when there is no official dossier', () => {
    const lookalike = scrutinFactory({ numero: 5, titre: scrutins[3].titre, dossier: null });
    expect(otherVotesOnSameText(scrutins[3], [...scrutins, lookalike])).toEqual([]);
  });
});

describe('Feature: fiches qui citent un scrutin', () => {
  it('should list the party pages whose sources cite this scrutin, alphabetically', () => {
    expect(citingParties(catalog, 580)).toEqual([
      { partyId: 'alpha', name: 'Alpha', section: 'positions' },
      { partyId: 'zeta', name: 'Zeta', section: 'positions' },
    ]);
  });

  it('should not confuse scrutin 580 with 5800', () => {
    expect(citingParties(catalog, 5800).map((c) => c.partyId)).toEqual(['alpha']);
  });

  it('should return nothing for a scrutin no page cites', () => {
    expect(citingParties(catalog, 1)).toEqual([]);
  });
});
