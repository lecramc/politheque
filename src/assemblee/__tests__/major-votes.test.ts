import {
  groupPosition,
  MAJOR_VOTES_LEGEND,
  majorVotesGrid,
  shortTitle,
  votesGrid,
  type CellKind,
} from '@/src/assemblee/models/major-votes';
import {
  groupeFactory,
  indexFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import type { GroupeDecompte } from '@/src/assemblee/models/scrutin.model';

/** [groupe, membres, pour, contre, abstentions, non-votants] */
const decompte = (
  pour: number,
  contre: number,
  abstentions: number,
  membres = 20
): GroupeDecompte => [0, membres, pour, contre, abstentions, 0];
const position = (d: GroupeDecompte, type: 'SPO' | 'MOC' = 'SPO'): CellKind =>
  groupPosition(d, type);

describe('Feature: position majoritaire d’un groupe sur un vote', () => {
  it('should be the position held by at least half of the members who voted', () => {
    expect(position(decompte(10, 3, 1))).toBe('pour');
    expect(position(decompte(1, 9, 2))).toBe('contre');
    expect(position(decompte(0, 2, 6))).toBe('abstention');
  });

  it('should be shared when no position reaches half of those who voted', () => {
    expect(position(decompte(4, 4, 4))).toBe('partage');
  });

  it('should be shared when two positions each hold exactly half', () => {
    expect(position(decompte(5, 5, 0))).toBe('partage');
  });

  it('should be absent when nobody in the group voted', () => {
    expect(position(decompte(0, 0, 0))).toBe('absent');
  });

  it('should only count the votes in favour for a motion of censure', () => {
    expect(position(decompte(15, 0, 0, 20), 'MOC')).toBe('pour');
    expect(position(decompte(0, 0, 0, 20), 'MOC')).toBe('motionNon');
    expect(position(decompte(4, 0, 0, 20), 'MOC')).toBe('partage');
  });
});

describe('Feature: titre court d’un vote', () => {
  it('should capitalise the official title, drop the final period and cut at a word', () => {
    expect(shortTitle("l'ensemble du projet de loi de finances.")).toBe(
      "L'ensemble du projet de loi de finances"
    );
    const cut = shortTitle('un titre '.repeat(30), 40);
    expect(cut.length).toBeLessThanOrEqual(41);
    expect(cut.endsWith('…')).toBe(true);
    expect(cut).not.toMatch(/\s…$/);
  });
});

const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'DX', libelle: 'Droite', medianePlace: 100 }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GA', libelle: 'Gauche', medianePlace: 500 }),
];

const vote = (numero: number, date: string, extra = {}) =>
  scrutinFactory({
    numero,
    date,
    groupes: [
      [0, 20, 10, 2, 0, 0],
      [1, 20, 0, 12, 0, 0],
    ],
    ...extra,
  });

describe('Feature: grille « qui vote quoi » des grands votes', () => {
  it('should keep only whole texts, censure, confidence and government declarations', () => {
    const grid = majorVotesGrid(
      indexFactory({
        groupes,
        scrutins: [
          vote(1, '2025-01-01', { categorie: 'texte' }),
          vote(2, '2025-01-02', { categorie: 'article-unique' }),
          vote(3, '2025-01-03', { categorie: 'resolution' }),
          vote(4, '2025-01-04', { categorie: 'censure', type: 'MOC' }),
          vote(5, '2025-01-05', { categorie: 'confiance' }),
          vote(6, '2025-01-06', { categorie: 'declaration' }),
          vote(7, '2025-01-07', { categorie: 'partie-budget' }),
        ],
      })
    );
    expect(grid.columns.map((c) => c.numero)).toEqual([6, 5, 4, 1]);
  });

  it('should keep the eight most recent, newest first', () => {
    const scrutins = Array.from({ length: 12 }, (_, i) =>
      vote(i + 1, `2025-02-${String(i + 10).padStart(2, '0')}`)
    );
    const grid = majorVotesGrid(indexFactory({ groupes, scrutins }));
    expect(grid.columns.map((c) => c.numero)).toEqual([12, 11, 10, 9, 8, 7, 6, 5]);
  });

  it('should head each column with a link, a short title, a date and the verdict', () => {
    const grid = majorVotesGrid(
      indexFactory({
        groupes,
        scrutins: [
          vote(9, '2025-03-10', { titre: "l'ensemble du projet de loi X.", adopte: false }),
        ],
      })
    );
    expect(grid.columns[0]).toMatchObject({
      numero: 9,
      href: '/assemblee/scrutins/9',
      title: "L'ensemble du projet de loi X",
      dateIso: '2025-03-10',
      resultat: 'Rejeté',
      adopte: false,
    });
    expect(grid.columns[0].date).toMatch(/10 mars 2025/);
  });

  it('should give one row per group, left to right, with one labelled cell per vote', () => {
    const grid = majorVotesGrid(
      indexFactory({ groupes, scrutins: [vote(1, '2025-01-01'), vote(2, '2025-01-02')] })
    );
    expect(grid.rows.map((r) => r.abrev)).toEqual(['GA', 'DX']);
    expect(grid.rows[0]).toMatchObject({ libelle: 'Gauche' });
    expect(grid.rows[0].cells.map((c) => [c.kind, c.label])).toEqual([
      ['contre', 'Contre'],
      ['contre', 'Contre'],
    ]);
    expect(grid.rows[1].cells.map((c) => c.kind)).toEqual(['pour', 'pour']);
  });

  it('should mark a group that had no député on that day, and leave out groups never present', () => {
    const grid = majorVotesGrid(
      indexFactory({
        groupes: [...groupes, groupeFactory({ organeRef: 'PO3', abrev: 'XX', medianePlace: 50 })],
        scrutins: [vote(1, '2025-01-01', { groupes: [[0, 20, 10, 2, 0, 0]] })],
      })
    );
    expect(grid.rows.map((r) => r.abrev)).toEqual(['DX']);
    const both = majorVotesGrid(
      indexFactory({
        groupes,
        scrutins: [
          vote(1, '2025-01-01', { groupes: [[0, 20, 10, 2, 0, 0]] }),
          vote(2, '2025-01-02'),
        ],
      })
    );
    expect(both.rows.find((r) => r.abrev === 'GA')!.cells.map((c) => c.kind)).toEqual([
      'contre',
      'sansDepute',
    ]);
  });

  it('should give each row the official colour of its group', () => {
    const grid = majorVotesGrid(
      indexFactory({
        groupes: [groupeFactory({ abrev: 'RN', medianePlace: 1, couleurOfficielle: '#313567' })],
        scrutins: [vote(1, '2025-01-01')],
      })
    );
    expect(grid.rows.map((r) => r.color)).toEqual(['#313567']);
  });

  it('should give a glyph to positions that have one and text to all of them', () => {
    const grid = majorVotesGrid(indexFactory({ groupes, scrutins: [vote(1, '2025-01-01')] }));
    expect(grid.rows[1].cells[0]).toMatchObject({ glyph: 'disc', label: 'Pour' });
    expect(grid.rows[0].cells[0]).toMatchObject({ glyph: 'disc-slash', label: 'Contre' });
  });

  it('should give the shared position a half-disc, and explain every position in a legend', () => {
    const grid = majorVotesGrid(
      indexFactory({
        groupes,
        scrutins: [vote(1, '2025-01-01', { groupes: [[0, 20, 4, 4, 4, 0]] })],
      })
    );
    expect(grid.rows[0].cells[0]).toMatchObject({ kind: 'partage', glyph: 'half' });
    expect(MAJOR_VOTES_LEGEND.map((e) => e.label)).toEqual([
      'Pour',
      'Contre',
      'Abstention',
      'Partagé',
      'Absent',
    ]);
  });
});

describe('Feature: grille « qui vote quoi » sur des votes choisis', () => {
  it('should show the given scrutins whatever their category, newest first, with the same rows', () => {
    const scrutins = [
      vote(1, '2025-01-01', { categorie: 'cite' }),
      vote(2, '2025-01-02', { categorie: 'article-unique' }),
    ];
    const index = indexFactory({ groupes, scrutins });
    const grid = votesGrid(index, scrutins);
    expect(grid.columns.map((c) => c.numero)).toEqual([2, 1]);
    expect(grid.rows.map((r) => r.abrev)).toEqual(['GA', 'DX']);
    expect(votesGrid(index, [])).toEqual({ columns: [], rows: [] });
  });
});
