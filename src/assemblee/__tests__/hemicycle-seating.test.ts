import { groupedSeating } from '@/src/assemblee/models/hemicycle-seating';
import { detailFactory, groupeFactory } from '@/src/assemblee/models/scrutin.factory';

// Index dans l'ordre de publication (officiel, de la gauche à la droite) : LFI, SOC, RN, NI.
const groupes = [
  groupeFactory({ organeRef: 'A', abrev: 'LFI-NFP' }),
  groupeFactory({ organeRef: 'B', abrev: 'SOC' }),
  groupeFactory({ organeRef: 'C', abrev: 'RN' }),
  groupeFactory({ organeRef: 'D', abrev: 'NI' }),
];

// Places réelles mêlées : les numéros de place ne suivent pas les groupes.
const detail = detailFactory({
  places: [1, 2, 3, 4, 5, 6],
  votes: 'PC.PAN',
  deputes: [10, 11, -1, 13, 14, 15],
  groupes: [3, 2, -1, 0, 1, 3],
  delegations: [4],
});

describe('Feature: sièges regroupés par groupe dans le schéma', () => {
  const seating = groupedSeating(detail, groupes);

  it('should renumber the seats from 1 with every group in one block, the last group (non-inscrits) at the right', () => {
    expect(seating.places).toEqual([1, 2, 3, 4, 5, 6]);
    // de la droite (place 1) à la gauche : vacant, NI, RN, SOC, LFI
    expect(seating.groupes).toEqual([-1, 3, 3, 2, 1, 0]);
  });

  it('should move each seat with its vote, deputy and delegation', () => {
    expect(seating.votes).toBe('.PNCAP'.replace('.PNCAP', '.PNCAP'));
    expect(seating.deputes).toEqual([-1, 10, 15, 11, 14, 13]);
    expect(seating.delegations).toEqual([4]);
  });

  it('should keep the real place order inside a group', () => {
    expect(seating.deputes.slice(1, 3)).toEqual([10, 15]);
  });

  it('should not mutate the detail', () => {
    expect(detail.groupes).toEqual([3, 2, -1, 0, 1, 3]);
  });
});
