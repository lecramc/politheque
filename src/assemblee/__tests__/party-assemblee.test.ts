import { partyAssemblee } from '@/src/assemblee/models/party-assemblee';
import {
  groupeFactory,
  indexFactory,
  manifestFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';

const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'DX', libelle: 'Droite', couleurOfficielle: '#112233' }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GA', libelle: 'Gauche', couleurOfficielle: '#445566' }),
];
const index = indexFactory({
  groupes,
  scrutins: [
    scrutinFactory({
      numero: 7,
      date: '2025-01-02',
      groupes: [
        [0, 20, 10, 2, 0, 0],
        [1, 20, 0, 12, 0, 0],
      ],
    }),
    scrutinFactory({
      numero: 6,
      date: '2025-01-01',
      groupes: [
        [0, 20, 1, 12, 0, 0],
        [1, 20, 9, 2, 0, 0],
      ],
    }),
  ],
});
const composition = {
  sieges: [
    [0, 1],
    [1, 42],
  ] as [number, number][],
  total: 43,
};
const manifest = manifestFactory({ extraitLe: '2026-11-18' });
const of = (groupe: string | null) => partyAssemblee({ groupe, index, composition, manifest });

describe("Feature: encart « À l'Assemblée » d'une fiche parti", () => {
  it('should show the official group, its colour and its number of deputies at the extraction date', () => {
    expect(of('GA')).toMatchObject({
      kind: 'group',
      color: '#445566',
      name: 'Gauche (GA)',
      count: '42 députés',
      updatedLine: "Effectif officiel au 18 novembre 2026, selon l'Assemblée nationale.",
    });
  });

  it('should say that a single deputy is a deputy, not deputies', () => {
    expect(of('DX')).toMatchObject({ count: '1 député' });
  });

  it('should give the position of that group only, on the latest major votes', () => {
    const panel = of('GA');
    if (panel.kind !== 'group') throw new Error('group expected');
    expect(panel.votes.map((v) => [v.href, v.position.kind])).toEqual([
      ['/assemblee/scrutins/7', 'contre'],
      ['/assemblee/scrutins/6', 'pour'],
    ]);
  });

  it('should say there is no group for a party without one', () => {
    expect(of(null)).toEqual({
      kind: 'none',
      title: "À l'Assemblée",
      text: "Pas de groupe à l'Assemblée nationale",
    });
  });

  it('should not claim a group it cannot find in the official data', () => {
    expect(of('ZZ').kind).toBe('none');
  });

  it('should share the same note and link for every group', () => {
    expect(of('GA')).toMatchObject({
      note: 'Un groupe peut réunir des élus de plusieurs partis.',
      all: { label: "Tous les votes de l'Assemblée", href: '/assemblee' },
    });
  });
});
