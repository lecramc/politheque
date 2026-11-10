import {
  indexFactory,
  manifestFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { assembleeListViewModel } from '@/src/assemblee/view-models/assemblee-list.view-model';

const scrutins = [
  scrutinFactory({
    numero: 10,
    date: '2025-01-22',
    titre: "l'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
    adopte: true,
    synthese: { ...scrutinFactory().synthese, pour: 446, contre: 2 },
  }),
  scrutinFactory({
    numero: 12,
    date: '2025-03-04',
    type: 'MOC',
    categorie: 'censure',
    titre: 'la motion de censure déposée par M. X.',
    adopte: false,
    synthese: { ...scrutinFactory().synthese, pour: 132, contre: 0, requis: 289 },
  }),
  scrutinFactory({
    numero: 11,
    date: '2025-03-20',
    titre: "l'ensemble du projet de loi de finances.",
    adopte: false,
  }),
  scrutinFactory({
    numero: 9,
    date: '2024-12-10',
    titre: "l'ensemble de la proposition de loi relative au budget.",
  }),
];

const vm = () =>
  assembleeListViewModel()(
    assembleeStateBuilder()
      .withIndex(indexFactory({ scrutins }))
      .withManifest(manifestFactory({ extraitLe: '2026-11-10', licence: 'Licence Ouverte' }))
      .build()
  );

const NONE = { categorie: 'toutes', resultat: 'tous', annee: null, recherche: '' } as const;

describe('Feature: liste des grands votes', () => {
  it('should be loading until the index is in the store', () => {
    const empty = assembleeListViewModel()(assembleeStateBuilder().build());
    expect(empty.status).toBe('loading');
    expect(empty.meta).toBeNull();
    expect(vm().status).toBe('loaded');
  });

  it('should list every scrutin from the most recent, grouped by month', () => {
    const { months, count, total } = vm().list(NONE);
    expect(months.map((m) => m.libelle)).toEqual(['Mars 2025', 'Janvier 2025', 'Décembre 2024']);
    expect(months[0].rows.map((r) => r.numero)).toEqual([11, 12]);
    expect([count, total]).toEqual([4, 4]);
  });

  it('should give each row its date, category, official title, result and counts', () => {
    const row = vm().list(NONE).months[1].rows[0];
    expect(row).toMatchObject({
      numero: 10,
      href: '/assemblee/scrutins/10',
      dateIso: '2025-01-22',
      date: '22 janvier 2025',
      categorie: "Vote sur l'ensemble d'un texte",
      titre: "L'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
      resultat: 'Adopté',
      adopte: true,
      decompte: '446 pour, 2 contre',
    });
  });

  it('should word a censure motion by its votes for and the required majority', () => {
    const row = vm().list(NONE).months[0].rows[1];
    expect(row).toMatchObject({ resultat: 'Rejetée', decompte: '132 voix pour, 289 requises' });
  });

  it('should filter by category, result, year and title', () => {
    expect(vm().list({ ...NONE, categorie: 'censure' }).count).toBe(1);
    expect(vm().list({ ...NONE, resultat: 'rejete' }).count).toBe(2);
    expect(vm().list({ ...NONE, annee: '2024' }).months[0].rows[0].numero).toBe(9);
    expect(vm().list({ ...NONE, recherche: 'mayotte' }).count).toBe(1);
  });

  it('should keep the total when filters leave nothing, to say so', () => {
    expect(vm().list({ ...NONE, recherche: 'zzz' })).toMatchObject({
      months: [],
      count: 0,
      total: 4,
    });
  });

  it('should offer only the categories and years that exist, oldest year first', () => {
    expect(vm().categories.map((c) => c.id)).toEqual(['texte', 'censure']);
    expect(vm().years).toEqual(['2024', '2025']);
  });

  it('should cite the source, the licence and the extraction date', () => {
    expect(vm().source?.line).toBe(
      'Source : Assemblée nationale, open data, Licence Ouverte. Données extraites le 10 novembre 2026.'
    );
  });

  it('should be indexable and carry the warning about votes by show of hands', () => {
    expect(vm().meta?.robots).toBe('index, follow');
    expect(vm().warning).toBe(
      "Seuls les votes par scrutin public sont enregistrés nominativement ; un texte adopté à main levée n'apparaît pas ici."
    );
  });
});
