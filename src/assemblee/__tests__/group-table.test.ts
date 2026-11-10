import { groupTable } from '@/src/assemblee/models/group-table';
import { groupeFactory, scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

const groupes = [
  groupeFactory({
    organeRef: 'PO1',
    abrev: 'LFI-NFP',
    libelle: 'La France insoumise',
    medianePlace: 600,
  }),
  groupeFactory({
    organeRef: 'PO2',
    abrev: 'RN',
    libelle: 'Rassemblement National',
    medianePlace: 100,
  }),
  groupeFactory({
    organeRef: 'PO3',
    abrev: 'DR',
    libelle: 'Droite Républicaine',
    medianePlace: 200,
  }),
];

const scrutin = scrutinFactory({
  groupes: [
    [1, 123, 100, 10, 5, 1],
    [0, 71, 0, 2, 67, 0],
  ],
});

describe('Feature: tableau des groupes d’un scrutin', () => {
  it('should list the groups of the scrutin in seat order, left to right of the diagram, by default', () => {
    const { rows } = groupTable(scrutin, groupes, 'places');
    expect(rows.map((r) => r.abrev)).toEqual(['LFI-NFP', 'RN']);
  });

  it('should offer an alphabetical order on the official label', () => {
    const { rows } = groupTable(scrutin, groupes, 'alphabetique');
    expect(rows.map((r) => r.libelle)).toEqual(
      ['Rassemblement National', 'La France insoumise'].sort((a, b) => a.localeCompare(b, 'fr'))
    );
  });

  it('should give the official label, the abbreviation and the official counts of each group', () => {
    const [first] = groupTable(scrutin, groupes, 'places').rows;
    expect(first).toMatchObject({
      index: 0,
      libelle: 'La France insoumise',
      abrev: 'LFI-NFP',
      membres: 71,
      pour: 0,
      contre: 2,
      abstentions: 67,
      nonVotants: 0,
    });
  });

  it('should not list groups that did not exist on the day', () => {
    expect(groupTable(scrutin, groupes, 'places').rows.map((r) => r.index)).not.toContain(2);
  });

  it('should show a censure motion as votes for and members who did not vote the motion, never against', () => {
    const motion = scrutinFactory({
      type: 'MOC',
      groupes: [
        [0, 71, 71, 0, 0, 0],
        [1, 123, 0, 0, 0, 1],
      ],
    });
    const table = groupTable(motion, groupes, 'places');
    expect(table.kind).toBe('censure');
    expect(table.rows.map((r) => r.nePasVote)).toEqual([0, 122]);
    expect(groupTable(scrutin, groupes, 'places').kind).toBe('standard');
  });
});
