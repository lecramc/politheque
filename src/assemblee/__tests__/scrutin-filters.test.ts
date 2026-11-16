import {
  filterScrutins,
  groupByMonth,
  sortByMostRecent,
} from '@/src/assemblee/models/scrutin-filters';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

const scrutins = [
  scrutinFactory({
    numero: 1,
    date: '2025-01-15',
    categorie: 'texte',
    adopte: true,
    titre: "l'ensemble du projet de loi de finances pour 2025 (première lecture).",
  }),
  scrutinFactory({
    numero: 2,
    date: '2025-01-15',
    categorie: 'censure',
    type: 'MOC',
    adopte: false,
    titre: "la motion de censure déposée en application de l'article 49, alinéa 2.",
  }),
  scrutinFactory({
    numero: 3,
    date: '2025-03-02',
    categorie: 'declaration',
    adopte: true,
    titre: 'la déclaration du Gouvernement portant sur la stratégie énergétique.',
  }),
  scrutinFactory({
    numero: 4,
    date: '2024-12-20',
    categorie: 'texte',
    adopte: false,
    titre: 'l’ensemble de la proposition de loi relative à l’école.',
  }),
];

describe('Feature: liste des scrutins', () => {
  it('should list scrutins from the most recent, ties by the highest number', () => {
    expect(sortByMostRecent(scrutins).map((s) => s.numero)).toEqual([3, 2, 1, 4]);
  });

  it('should not mutate the list it sorts', () => {
    const copy = [...scrutins];
    sortByMostRecent(scrutins);
    expect(scrutins).toEqual(copy);
  });

  it('should keep everything without filters', () => {
    expect(filterScrutins(scrutins, {}).map((s) => s.numero)).toEqual([1, 2, 3, 4]);
  });

  it('should filter by category', () => {
    expect(filterScrutins(scrutins, { categorie: 'texte' }).map((s) => s.numero)).toEqual([1, 4]);
    expect(filterScrutins(scrutins, { categorie: 'censure' }).map((s) => s.numero)).toEqual([2]);
  });

  it('should filter by result', () => {
    expect(filterScrutins(scrutins, { resultat: 'adopte' }).map((s) => s.numero)).toEqual([1, 3]);
    expect(filterScrutins(scrutins, { resultat: 'rejete' }).map((s) => s.numero)).toEqual([2, 4]);
  });

  it('should filter by period, bounds included', () => {
    expect(
      filterScrutins(scrutins, { du: '2025-01-15', au: '2025-01-15' }).map((s) => s.numero)
    ).toEqual([1, 2]);
    expect(filterScrutins(scrutins, { du: '2025-02-01' }).map((s) => s.numero)).toEqual([3]);
    expect(filterScrutins(scrutins, { au: '2024-12-31' }).map((s) => s.numero)).toEqual([4]);
  });

  it('should search the title ignoring case, accents and apostrophe style', () => {
    expect(filterScrutins(scrutins, { recherche: 'ECOLE' }).map((s) => s.numero)).toEqual([4]);
    expect(filterScrutins(scrutins, { recherche: "l'école" }).map((s) => s.numero)).toEqual([4]);
    expect(
      filterScrutins(scrutins, { recherche: 'declaration gouvernement' }).map((s) => s.numero)
    ).toEqual([3]);
  });

  it('should combine the filters', () => {
    expect(
      filterScrutins(scrutins, { categorie: 'texte', resultat: 'rejete', recherche: 'loi' }).map(
        (s) => s.numero
      )
    ).toEqual([4]);
  });

  it('should ignore an empty search and the « all » choices', () => {
    expect(
      filterScrutins(scrutins, { recherche: '  ', categorie: 'toutes', resultat: 'tous' })
    ).toHaveLength(4);
  });
});

describe('Feature: regroupement par mois', () => {
  it('should group the list by month, most recent first, with a French label', () => {
    expect(groupByMonth(sortByMostRecent(scrutins))).toEqual([
      { mois: '2025-03', libelle: 'mars 2025', scrutins: [scrutins[2]] },
      { mois: '2025-01', libelle: 'janvier 2025', scrutins: [scrutins[1], scrutins[0]] },
      { mois: '2024-12', libelle: 'décembre 2024', scrutins: [scrutins[3]] },
    ]);
  });

  it('should return no group for an empty list', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
