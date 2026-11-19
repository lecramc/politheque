import { PERIMETER_RULES } from '@/src/assemblee/models/extraction/perimeter';
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

describe('Feature: liste des votes', () => {
  it('should be loading until the index is in the store', () => {
    const empty = assembleeListViewModel()(assembleeStateBuilder().build());
    expect(empty.status).toBe('loading');
    expect(empty.meta).toBeNull();
    expect(vm().status).toBe('loaded');
  });

  it('should write the closed list of rules exactly, and say what is left out', () => {
    const { criteria } = vm();
    expect(criteria.rules).toEqual(PERIMETER_RULES);
    expect(criteria.lead).toContain('règle fixe');
    expect(criteria.lead).not.toContain('sans exception ni choix éditorial');
    expect(criteria.excluded).toContain('amendements');
  });

  it('should recall article 49, alinéa 3, with its source', () => {
    expect(vm().article493).toMatchObject({
      text: expect.stringContaining("Un texte adopté ainsi n'a pas de vote final"),
      sourceUrl: expect.stringContaining('conseil-constitutionnel.fr'),
    });
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
      categorie: 'Texte entier',
      reference: 'Scrutin n° 10',
      titre: "L'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
      resultat: 'Adopté',
      adopte: true,
      decompte: '446 pour · 2 contre · 1 abstention',
    });
  });

  it('should word a censure motion by its votes for and the required majority', () => {
    const row = vm().list(NONE).months[0].rows[1];
    expect(row).toMatchObject({ resultat: 'Rejetée', decompte: '132 pour · 289 nécessaires' });
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
      "Les votes à main levée ne sont pas enregistrés nom par nom : ils n'apparaissent pas ici."
    );
  });

  it('should open with a two-sentence lead that says what is on the page', () => {
    expect(vm().lead).toBe(
      'Comment les députés ont voté sur les lois, le budget et les motions de censure depuis 2024. Pour chaque vote : le résultat, et le choix de chaque groupe et de chaque député.'
    );
    expect(vm().criteria.title).toBe('Quels votes figurent ici ?');
  });
});

describe('Feature: liste des votes, par pages de vingt', () => {
  const many = Array.from({ length: 45 }, (_, i) =>
    scrutinFactory({
      numero: 100 + i,
      date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
      titre:
        i % 2 === 0 ? "l'ensemble du projet de loi pair." : "l'ensemble du projet de loi impair.",
      adopte: i % 2 === 0,
    })
  );
  const big = () =>
    assembleeListViewModel()(
      assembleeStateBuilder()
        .withIndex(indexFactory({ scrutins: many }))
        .withManifest(manifestFactory())
        .build()
    );
  const rowsOf = (list: ReturnType<ReturnType<typeof big>['list']>) =>
    list.months.flatMap((m) => m.rows);

  it('should show the 20 most recent votes first, and offer 20 more', () => {
    const list = big().list(NONE);
    expect(rowsOf(list)).toHaveLength(20);
    expect(list.moreLabel).toBe('Voir 20 votes de plus');
    expect(rowsOf(list)[0].dateIso >= rowsOf(list)[19].dateIso).toBe(true);
  });

  it('should show the next twenty, then only what is left, then no button', () => {
    const second = big().list(NONE, 40);
    expect(rowsOf(second)).toHaveLength(40);
    expect(second.moreLabel).toBe('Voir 5 votes de plus');
    const all = big().list(NONE, 60);
    expect(rowsOf(all)).toHaveLength(45);
    expect(all.moreLabel).toBeNull();
  });

  it('should apply the filters to the whole list, not to the visible page', () => {
    const list = big().list({ ...NONE, resultat: 'adopte' });
    expect(list.count).toBe(23);
    expect(rowsOf(list)).toHaveLength(20);
    expect(list.moreLabel).toBe('Voir 3 votes de plus');
    expect(big().list({ ...NONE, recherche: 'impair' }).count).toBe(22);
  });

  it('should count the votes in the word of the page, and say « sur N » only when filtered', () => {
    expect(big().list(NONE).countLabel).toBe('45 votes');
    expect(big().list({ ...NONE, resultat: 'adopte' }).countLabel).toBe('23 votes sur 45');
    expect(big().list({ ...NONE, recherche: 'zzz' }).countLabel).toBe('0 vote sur 45');
  });

  it('should list the first page only in the prerendered HTML: the default is twenty', () => {
    expect(rowsOf(big().list(NONE))).toHaveLength(20);
  });
});

describe('Feature: feuille de filtres de la liste', () => {
  it('should give each category its short label and its one-line help, in the order of the sheet', () => {
    expect(vm().categories).toEqual([
      {
        id: 'texte',
        label: 'Texte entier',
        help: 'Vote final sur une loi ou une résolution, tous articles réunis.',
      },
      {
        id: 'censure',
        label: 'Censure du Gouvernement',
        help: 'Les députés votent pour renverser le Gouvernement.',
      },
    ]);
  });

  it('should label the button with the number of active filters', () => {
    expect(vm().filterButton(NONE)).toEqual({ label: 'Filtrer', active: false });
    expect(vm().filterButton({ ...NONE, categorie: 'censure' })).toEqual({
      label: 'Filtrer · 1',
      active: true,
    });
    expect(vm().filterButton({ ...NONE, categorie: 'censure', annee: '2025' }).label).toBe(
      'Filtrer · 2'
    );
    expect(vm().filterButton({ ...NONE, recherche: 'budget' }).label).toBe('Filtrer');
  });
});
