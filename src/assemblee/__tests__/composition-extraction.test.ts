import type { ActeurRecord } from '@/src/assemblee/models/extraction/amo';
import { currentComposition } from '@/src/assemblee/models/extraction/composition';
import { deputeFactory, groupeFactory } from '@/src/assemblee/models/scrutin.factory';

const acteur = (
  id: string,
  groupeRef: string,
  extra: Partial<ActeurRecord> = {},
  fin: string | null = null
): ActeurRecord => ({
  ...deputeFactory({ id }),
  placeHemicycle: null,
  mandatsAssemblee: [{ debut: '2024-07-18', fin }],
  groupes: [{ groupeRef, debut: '2024-07-18', fin }],
  ...extra,
});

const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'GA' }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GB' }),
];

describe('Feature: composition actuelle de l’Assemblée à l’extraction', () => {
  it('should count the sitting députés of each published group, by group index', () => {
    const composition = currentComposition({
      acteurs: [acteur('a', 'PO2'), acteur('b', 'PO2'), acteur('c', 'PO1')],
      groupes,
      date: '2026-11-16',
    });
    expect(composition).toEqual({
      sieges: [
        [0, 1],
        [1, 2],
      ],
      total: 3,
    });
  });

  it('should leave out groups without any sitting député and députés who left', () => {
    const composition = currentComposition({
      acteurs: [acteur('a', 'PO1'), acteur('b', 'PO2', { enExercice: false }, '2025-01-01')],
      groupes,
      date: '2026-11-16',
    });
    expect(composition).toEqual({ sieges: [[0, 1]], total: 1 });
  });
});
