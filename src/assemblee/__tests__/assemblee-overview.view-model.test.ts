import {
  groupeFactory,
  indexFactory,
  manifestFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import {
  assembleeOverviewViewModel,
  LAW_LESSON_ID,
} from '@/src/assemblee/view-models/assemblee-overview.view-model';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';

const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'DX', libelle: 'Droite', medianePlace: 100 }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GA', libelle: 'Gauche', medianePlace: 500 }),
];
const scrutins = [
  scrutinFactory({
    numero: 5,
    date: '2026-11-10',
    groupes: [
      [0, 20, 15, 0, 0, 0],
      [1, 20, 0, 15, 0, 0],
    ],
  }),
];

const section = (id: string) => ({ id }) as never;
const base = (guideIds: string[] = []) =>
  assembleeStateBuilder(
    stateBuilder()
      .withCatalog(catalogFactory({ guide: guideIds.map(section) }))
      .build()
  )
    .withIndex(indexFactory({ groupes, scrutins }))
    .withManifest(manifestFactory({ extraitLe: '2026-11-17' }))
    .withComposition({
      sieges: [
        [0, 30],
        [1, 20],
      ],
      total: 50,
    });

describe('Feature: vue d’ensemble de l’Assemblée', () => {
  it('should wait for the index and the composition', () => {
    const vm = assembleeOverviewViewModel()(assembleeStateBuilder().build());
    expect(vm).toMatchObject({ status: 'loading', sitting: null, grid: null });
  });

  it('should tell who sits today, dated from the extraction, with the majority landmark', () => {
    const { sitting } = assembleeOverviewViewModel()(base().build());
    expect(sitting).toMatchObject({
      title: "Qui siège aujourd'hui",
      majority: 'Majorité absolue : 289 sièges',
      sentence: "Aucun groupe n'a la majorité absolue ; le plus grand compte 30 sièges.",
      total: 50,
    });
    expect(sitting?.lead).toMatch(/17 novembre 2026/);
    expect(sitting?.rows.map((r) => [r.abrev, r.seatsLabel])).toEqual([
      ['GA', '20 sièges'],
      ['DX', '30 sièges'],
    ]);
    expect(sitting?.vacant).toBe('527 sièges vacants dans les données');
    expect(sitting?.scene.seats).toHaveLength(50);
  });

  it('should give the grid of the major votes with the method note under it', () => {
    const { grid } = assembleeOverviewViewModel()(base().build());
    expect(grid?.note).toBe(
      'Position majoritaire du groupe ; la règle exacte est ci-dessous, le détail député par député est dans chaque vote.'
    );
    expect(grid?.columns.map((c) => c.numero)).toEqual([5]);
    expect(grid?.rows.map((r) => r.cells.map((c) => c.label))).toEqual([['Contre'], ['Pour']]);
  });

  it('should offer the lesson on how a law is voted only when the guide has it', () => {
    const without = assembleeOverviewViewModel()(base(['institutions']).build());
    expect(without.law).toBeNull();
    const withLesson = assembleeOverviewViewModel()(base(['institutions', LAW_LESSON_ID]).build());
    expect(withLesson.law).toMatchObject({
      title: 'Comment une loi est votée',
      href: '/comprendre/comment-une-loi-est-votee',
    });
  });
});
