import { rawActeurs, rawOrganes } from '@/src/assemblee/__tests__/fixtures/raw-amo.fixtures';
import {
  motionCensure,
  spoAmendement,
  spoArticleUniqueLoi,
  spsEnsemble,
} from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import { parseActeur, parseGroupe } from '@/src/assemblee/models/extraction/amo';
import { compactDataset } from '@/src/assemblee/models/extraction/compact';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';

const build = (scrutins: RawScrutin[] = [spsEnsemble(), motionCensure()]) =>
  compactDataset({
    scrutins,
    acteurs: rawActeurs().flatMap((a) => parseActeur(a) ?? []),
    groupes: rawOrganes().flatMap((o) => parseGroupe(o) ?? []),
  });

const summaryOf = (numero: number, scrutins?: RawScrutin[]) => {
  const found = build(scrutins).scrutins.find((s) => s.summary.numero === numero);
  if (!found) throw new Error(`scrutin ${numero} absent`);
  return found.summary;
};

describe('Feature: extraction compacte — résumé d’un scrutin', () => {
  it('should only keep the scrutins inside the perimeter', () => {
    const dataset = build([spoAmendement(), spsEnsemble(), spoArticleUniqueLoi()]);
    expect(dataset.scrutins.map((s) => s.summary.numero)).toEqual([10, 40]);
  });

  it('should carry the official title untouched, the date, the type, the rules and the category', () => {
    expect(summaryOf(10)).toMatchObject({
      numero: 10,
      uid: 'VTANR5L17V10',
      date: '2025-03-10',
      type: 'SPS',
      categorie: 'texte',
      regles: ['R1'],
      titre: 'l’ensemble du projet de loi relatif à la simplification (première lecture).',
      adopte: true,
      demandeur: 'Conférence des Présidents',
    });
  });

  it('should read the official synthesis as numbers', () => {
    expect(summaryOf(10).synthese).toEqual({
      votants: 4,
      exprimes: 3,
      requis: 2,
      pour: 2,
      contre: 1,
      abstentions: 1,
      nonVotants: 1,
      nonVotantsVolontaires: 0,
    });
  });

  it('should keep group totals equal to the official synthesis', () => {
    const { groupes, synthese } = summaryOf(10);
    const total = (column: 2 | 3 | 4 | 5) => groupes.reduce((n, g) => n + g[column], 0);
    expect([total(2), total(3), total(4), total(5)]).toEqual([
      synthese.pour,
      synthese.contre,
      synthese.abstentions,
      synthese.nonVotants,
    ]);
  });

  it('should link the legislative file only through the official identifier', () => {
    expect(summaryOf(10).dossier).toEqual({
      uid: 'DLR5L17N1',
      url: 'https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N1',
    });
    expect(summaryOf(20).dossier).toBeNull();
  });

  it('should count the delegations and the mises au point for pre-rendering', () => {
    expect(summaryOf(10)).toMatchObject({ delegations: 1, misesAuPoint: 1 });
    expect(summaryOf(20)).toMatchObject({ delegations: 0, misesAuPoint: 0 });
  });
});

describe('Feature: extraction compacte — groupes', () => {
  it('should index the groups in the order of the seats, from the left of the image to the right', () => {
    // place 1 est à droite de l'image : médiane la plus haute = le plus à gauche
    const { groupes } = build();
    expect(groupes.map((g) => g.abrev)).toEqual(['GC', 'GB', 'GA']);
    expect(groupes.map((g) => g.medianePlace)).toEqual([300, 151, 10]);
  });

  it('should list each group count in the index order with its member count', () => {
    expect(summaryOf(10).groupes).toEqual([
      [0, 2, 0, 0, 0, 1],
      [1, 2, 0, 1, 1, 0],
      [2, 2, 2, 0, 0, 0],
    ]);
  });
});
