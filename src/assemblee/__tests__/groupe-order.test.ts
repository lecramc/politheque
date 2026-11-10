import { orderGroupes } from '@/src/assemblee/models/groupe-order';
import { groupeFactory } from '@/src/assemblee/models/scrutin.factory';

const groupes = [
  groupeFactory({
    organeRef: 'PO1',
    abrev: 'RN',
    libelle: 'Rassemblement National',
    medianePlace: 72,
  }),
  groupeFactory({
    organeRef: 'PO2',
    abrev: 'LFI-NFP',
    libelle: 'La France insoumise',
    medianePlace: 604,
  }),
  groupeFactory({
    organeRef: 'PO3',
    abrev: 'ECOS',
    libelle: 'Écologiste et Social',
    medianePlace: 512,
  }),
  groupeFactory({
    organeRef: 'PO4',
    abrev: 'DR',
    libelle: 'Droite Républicaine',
    medianePlace: 185,
  }),
];

describe('Feature: ordre des groupes', () => {
  it('should order groups by seat order, from the left of the image (highest places) to the right', () => {
    expect(orderGroupes(groupes, 'places').map((g) => g.abrev)).toEqual([
      'LFI-NFP',
      'ECOS',
      'DR',
      'RN',
    ]);
  });

  it('should offer an alphabetical sort on the official label, accents ignored', () => {
    expect(orderGroupes(groupes, 'alphabetique').map((g) => g.abrev)).toEqual([
      'DR',
      'ECOS',
      'LFI-NFP',
      'RN',
    ]);
  });

  it('should keep the index of each group in the published list, whatever the order', () => {
    expect(orderGroupes(groupes, 'alphabetique').map((g) => g.index)).toEqual([3, 2, 1, 0]);
  });

  it('should be stable for equal medians by falling back on the abbreviation then the identifier', () => {
    const twins = [
      groupeFactory({ organeRef: 'PO9', abrev: 'UDR', medianePlace: 99 }),
      groupeFactory({ organeRef: 'PO8', abrev: 'UDR', medianePlace: 99 }),
    ];
    expect(orderGroupes(twins, 'places').map((g) => g.organeRef)).toEqual(['PO8', 'PO9']);
  });

  it('should not mutate its input', () => {
    const copy = [...groupes];
    orderGroupes(groupes, 'alphabetique');
    expect(groupes).toEqual(copy);
  });
});
