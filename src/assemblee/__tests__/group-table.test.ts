import { groupTable, groupTableColumns } from '@/src/assemblee/models/group-table';
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

describe('Feature: une ligne par groupe sur la page d’un vote', () => {
  const row = (counts: [number, number, number, number, number], index = 0) =>
    groupTable(scrutinFactory({ groupes: [[index, ...counts]] }), groupes, 'places').rows[0];

  it('should title each line with the name, the abbreviation and the number of deputies', () => {
    expect(row([71, 0, 2, 67, 0]).title).toBe('La France insoumise (LFI-NFP) · 71 députés');
    expect(row([1, 1, 0, 0, 0]).title).toBe('La France insoumise (LFI-NFP) · 1 député');
  });

  it('should count the members who did not vote so that the total is right', () => {
    // SOC : 68 membres, 27 contre, les 41 autres n'apparaissent dans aucune colonne.
    expect(row([68, 0, 27, 0, 0]).nonVote).toBe(41);
    expect(row([68, 10, 20, 5, 2]).nonVote).toBe(31);
    expect(row([10, 5, 5, 0, 0]).nonVote).toBe(0);
  });

  it('should say only the non-zero positions, in a fixed order, with « n’ont pas voté » last', () => {
    expect(row([68, 0, 27, 0, 0]).sentence).toBe("27 contre · 41 n'ont pas voté");
    expect(row([100, 30, 20, 10, 5]).sentence).toBe(
      "30 pour · 20 contre · 10 abstentions · 5 ne prennent pas part au vote · 35 n'ont pas voté"
    );
  });

  it('should use singular forms', () => {
    expect(row([4, 1, 1, 1, 1]).sentence).toBe(
      '1 pour · 1 contre · 1 abstention · 1 ne prend pas part au vote'
    );
    expect(row([2, 0, 0, 0, 0]).sentence).toBe("2 n'ont pas voté");
    expect(row([2, 1, 0, 0, 0]).sentence).toBe("1 pour · 1 n'a pas voté");
  });

  it('should never name a majority position of the group', () => {
    const sentence = row([100, 60, 10, 10, 0]).sentence;
    expect(sentence).not.toMatch(/majorit|plupart|souvent|essentiel/i);
  });

  it('should word a censure motion: how many voted it and how many did not', () => {
    const motion = scrutinFactory({
      type: 'MOC',
      groupes: [
        [0, 71, 71, 0, 0, 0],
        [1, 123, 0, 0, 0, 1],
        [2, 10, 4, 0, 0, 0],
      ],
    });
    const rows = groupTable(motion, groupes, 'places').rows;
    expect(rows.map((r) => r.sentence)).toEqual([
      '71 ont voté la motion',
      "4 ont voté la motion · 6 ne l'ont pas votée",
      "123 ne l'ont pas votée",
    ]);
    const single = groupTable(
      scrutinFactory({ type: 'MOC', groupes: [[0, 2, 1, 0, 0, 0]] }),
      groupes,
      'places'
    ).rows[0];
    expect(single.sentence).toBe("1 a voté la motion · 1 ne l'a pas votée");
  });

  it('should draw a stacked bar with the same four positions, the non-votants joining « n’ont pas voté »', () => {
    expect(row([100, 30, 20, 10, 5]).bar).toEqual([
      { kind: 'pour', count: 30 },
      { kind: 'contre', count: 20 },
      { kind: 'abstention', count: 10 },
      { kind: 'aucun', count: 40 },
    ]);
    expect(row([68, 0, 27, 0, 0]).bar).toEqual([
      { kind: 'contre', count: 27 },
      { kind: 'aucun', count: 41 },
    ]);
  });

  it('should draw a censure bar with the votes for and the members who did not vote the motion', () => {
    const motion = scrutinFactory({ type: 'MOC', groupes: [[1, 123, 3, 0, 0, 1]] });
    expect(groupTable(motion, groupes, 'places').rows[0].bar).toEqual([
      { kind: 'pour', count: 3 },
      { kind: 'aucun', count: 120 },
    ]);
  });

  it('should call the non-inscrits what they are, without a rule for any other group', () => {
    const withNi = [
      ...groupes,
      groupeFactory({ organeRef: 'PO9', abrev: 'NI', libelle: 'Non inscrit' }),
    ];
    const ni = groupTable(scrutinFactory({ groupes: [[3, 12, 0, 0, 0, 0]] }), withNi, 'places')
      .rows[0];
    expect(ni.name).toBe('Non-inscrits : députés sans groupe (NI)');
  });

  it('should keep the full table of numbers, with columns that add up to the members', () => {
    const [standard] = groupTable(
      scrutinFactory({ groupes: [[0, 100, 30, 20, 10, 5]] }),
      groupes,
      'places'
    ).rows;
    const std = groupTableColumns('standard');
    expect(std.map((c) => c.label)).toEqual([
      'Membres',
      'Pour',
      'Contre',
      'Abstentions',
      'Ne prennent pas part au vote',
      "N'ont pas voté",
    ]);
    const [members, ...parts] = std.map((c) => c.value(standard));
    expect(parts.reduce((a, b) => a + b, 0)).toBe(members);

    const [motion] = groupTable(
      scrutinFactory({ type: 'MOC', groupes: [[1, 123, 3, 0, 0, 1]] }),
      groupes,
      'places'
    ).rows;
    const cens = groupTableColumns('censure');
    expect(cens.map((c) => c.label)).toEqual([
      'Membres',
      'Ont voté la motion',
      "N'ont pas voté la motion",
      'Ne prennent pas part au vote',
    ]);
    const [m, ...p] = cens.map((c) => c.value(motion));
    expect(p.reduce((a, b) => a + b, 0)).toBe(m);
  });

  it('should write the abbreviation only once when it is also the official name', () => {
    const same = [groupeFactory({ organeRef: 'PO7', abrev: 'UDR', libelle: 'UDR' })];
    expect(
      groupTable(scrutinFactory({ groupes: [[0, 5, 0, 0, 0, 0]] }), same, 'places').rows[0].name
    ).toBe('UDR');
  });
});
