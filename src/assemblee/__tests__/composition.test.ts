import published from '@/src/assemblee/data/composition.json';
import index from '@/src/assemblee/data/scrutins-index.json';
import {
  ABSOLUTE_MAJORITY,
  compositionScene,
  compositionSummary,
  TOTAL_SEATS,
} from '@/src/assemblee/models/composition';
import { GROUP_FALLBACK_COLOR } from '@/src/assemblee/models/group-color';
import { groupeFactory } from '@/src/assemblee/models/scrutin.factory';
import type { Composition } from '@/src/assemblee/models/scrutin.model';

// Index = ordre de publication ; la médiane des places décide du rang gauche → droite.
const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'DX', libelle: 'Droite', medianePlace: 100 }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GA', libelle: 'Gauche', medianePlace: 500 }),
  groupeFactory({ organeRef: 'PO3', abrev: 'CE', libelle: 'Centre', medianePlace: 300 }),
];

const composition = (sieges: [number, number][]): Composition => ({
  sieges,
  total: sieges.reduce((sum, [, n]) => sum + n, 0),
});

describe('Feature: composition actuelle de l’Assemblée', () => {
  it('should fix the seat total and the absolute majority', () => {
    expect([TOTAL_SEATS, ABSOLUTE_MAJORITY]).toEqual([577, 289]);
  });

  it('should list the groups from left to right with short name, long name and seats', () => {
    const { rows } = compositionSummary(
      composition([
        [0, 120],
        [1, 70],
        [2, 90],
      ]),
      groupes
    );
    expect(rows.map((r) => [r.abrev, r.libelle, r.sieges])).toEqual([
      ['GA', 'Gauche', 70],
      ['CE', 'Centre', 90],
      ['DX', 'Droite', 120],
    ]);
  });

  it('should give each row the official colour of its group, with a neutral fallback', () => {
    const coloured = [
      groupeFactory({ abrev: 'DX', medianePlace: 100, couleurOfficielle: '#313567' }),
      groupeFactory({ abrev: 'GA', medianePlace: 500, couleurOfficielle: '' }),
    ];
    const { rows } = compositionSummary(
      composition([
        [0, 10],
        [1, 20],
      ]),
      coloured
    );
    expect(rows.map((r) => r.color)).toEqual([GROUP_FALLBACK_COLOR, '#313567']);
  });

  it('should say that no group holds the absolute majority and name the largest size', () => {
    const { sentence } = compositionSummary(
      composition([
        [0, 120],
        [1, 70],
      ]),
      groupes
    );
    expect(sentence).toBe(
      "Aucun groupe n'a la majorité absolue ; le plus grand compte 120 sièges."
    );
  });

  it('should say the opposite when a group holds the absolute majority', () => {
    const { sentence } = compositionSummary(composition([[2, 300]]), groupes);
    expect(sentence).toBe('Le groupe Centre (CE) a la majorité absolue, avec 300 sièges.');
  });

  it('should count vacant seats apart, and say nothing when there are none', () => {
    const some = compositionSummary(composition([[0, 565]]), groupes);
    expect(some.vacant).toBe('12 sièges vacants dans les données');
    const none = compositionSummary(composition([[0, TOTAL_SEATS]]), groupes);
    expect(none.vacant).toBeNull();
  });

  it('should place the seats of each group in a block, the left group on the left', () => {
    const rows = compositionSummary(
      composition([
        [0, 20],
        [1, 10],
      ]),
      groupes
    ).rows;
    const scene = compositionScene(rows, groupes);
    expect(scene.seats).toHaveLength(30);
    const leftmost = [...scene.seats].sort((a, b) => b.angle - a.angle).slice(0, 10);
    expect(new Set(leftmost.map((s) => s.groupe))).toEqual(new Set([1]));
    expect(scene.arcs.map((a) => a.abrev).sort()).toEqual(['DX', 'GA']);
  });

  it('should fill each seat with the official colour of its group', () => {
    const coloured = [
      groupeFactory({ abrev: 'DX', medianePlace: 100, couleurOfficielle: '#313567' }),
      groupeFactory({ abrev: 'GA', medianePlace: 500, couleurOfficielle: '#C00D0D' }),
    ];
    const rows = compositionSummary(
      composition([
        [0, 5],
        [1, 5],
      ]),
      coloured
    ).rows;
    const { seats } = compositionScene(rows, coloured);
    expect(new Set(seats.filter((s) => s.groupe === 1).map((s) => s.color))).toEqual(
      new Set(['#C00D0D'])
    );
    expect(new Set(seats.filter((s) => s.groupe === 0).map((s) => s.color))).toEqual(
      new Set(['#313567'])
    );
  });
});

describe('Feature: composition publiée', () => {
  it('should only refer to published groups and never exceed the seats of the Assemblée', () => {
    expect(published.sieges.every(([group]) => group >= 0 && group < index.groupes.length)).toBe(
      true
    );
    expect(published.sieges.reduce((sum, [, count]) => sum + count, 0)).toBe(published.total);
    expect(published.total).toBeLessThanOrEqual(TOTAL_SEATS);
  });
});
