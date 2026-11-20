import {
  groupeFactory,
  indexFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { stanceVotes } from '@/src/assemblee/models/stance-votes';
import type { PartyStance, Source } from '@/src/programmes/models/programme.model';

const an = (n: number, leg = 17) => `https://www.assemblee-nationale.fr/dyn/${leg}/scrutins/${n}`;
const source = (url: string, kind: Source['kind'] = 'vote'): Source => ({
  title: 't',
  url,
  date: '2026-01-01',
  kind,
});
const stance = (...sources: Source[]): PartyStance => ({
  stance: -2,
  justification: 'j',
  sources,
});

const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'RN', libelle: 'Rassemblement National' }),
  groupeFactory({ organeRef: 'PO2', abrev: 'OLD', libelle: 'Ancien groupe', fin: '2025-01-01' }),
];
const vote = (numero: number, date: string, extra = {}) =>
  scrutinFactory({
    numero,
    date,
    titre: "l'amendement n° 12 de M. Untel.",
    adopte: false,
    groupes: [
      [0, 88, 0, 88, 0, 0],
      [1, 5, 5, 0, 0, 0],
    ],
    ...extra,
  });
const index = (...scrutins: ReturnType<typeof vote>[]) => indexFactory({ groupes, scrutins });

describe('Feature: le vote du groupe sous une position de parti', () => {
  it('should describe the group vote on a cited scrutin', () => {
    const [found] = stanceVotes({
      stance: stance(source(an(3300))),
      groupe: 'RN',
      index: index(vote(3300, '2025-10-31')),
    });
    expect(found).toMatchObject({
      numero: 3300,
      href: '/assemblee/scrutins/3300',
      title: "L'amendement n° 12 de M. Untel",
      resultat: 'Rejeté',
      groupName: 'Rassemblement National (RN)',
      position: { kind: 'contre', label: 'Contre', glyph: 'disc-slash' },
      detail: '88 contre',
    });
    expect(found.date).toMatch(/31 octobre 2025/);
  });

  it('should show nothing without a group, or when the group is absent from the scrutin', () => {
    const stances = stance(source(an(1)));
    expect(
      stanceVotes({ stance: stances, groupe: null, index: index(vote(1, '2025-01-01')) })
    ).toEqual([]);
    expect(
      stanceVotes({
        stance: stances,
        groupe: 'RN',
        index: index(vote(1, '2025-01-01', { groupes: [[1, 5, 5, 0, 0, 0]] })),
      })
    ).toEqual([]);
    expect(
      stanceVotes({ stance: stances, groupe: 'ZZ', index: index(vote(1, '2025-01-01')) })
    ).toEqual([]);
  });

  it('should match the group by its abbreviation even when it is no longer the active group', () => {
    const found = stanceVotes({
      stance: stance(source(an(1))),
      groupe: 'OLD',
      index: index(vote(1, '2025-01-01')),
    });
    expect(found.map((v) => v.position.kind)).toEqual(['pour']);
  });

  it('should only keep vote sources of the 17th legislature present in the index, newest first, once each', () => {
    const found = stanceVotes({
      stance: stance(
        source(an(1)),
        source(an(2)),
        source(an(2)),
        source(an(44, 16)),
        source(an(3)),
        source(an(1), 'presse')
      ),
      groupe: 'RN',
      index: index(vote(1, '2025-01-01'), vote(2, '2025-02-01')),
    });
    expect(found.map((v) => v.numero)).toEqual([2, 1]);
  });

  it('should ignore a position without any sources', () => {
    expect(
      stanceVotes({ stance: null, groupe: 'RN', index: index(vote(1, '2025-01-01')) })
    ).toEqual([]);
  });
});
