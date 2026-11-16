import {
  capitalizeTitle,
  categoryHelp,
  categoryLabel,
  countsLabel,
  requesters,
  resultLabel,
  scrutinHeading,
  scrutinReference,
  voteTypeDetail,
  voteTypeLabel,
} from '@/src/assemblee/models/scrutin-labels';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

describe('Feature: libellés d’un vote', () => {
  it('should name every category in a few plain words', () => {
    expect(categoryLabel('texte')).toBe('Texte entier');
    expect(categoryLabel('article-unique')).toBe('Texte à un seul article');
    expect(categoryLabel('censure')).toBe('Censure du Gouvernement');
    expect(categoryLabel('declaration')).toBe('Déclaration du Gouvernement');
    expect(categoryLabel('resolution')).toBe('Résolution');
    expect(categoryLabel('partie-budget')).toBe('Budget : une partie');
    expect(categoryLabel('confiance')).toBe('Vote de confiance');
    expect(categoryLabel('rejet-prealable')).toBe('Rejet préalable');
  });

  it('should explain every category in one line', () => {
    expect(categoryHelp('texte')).toBe(
      'Vote final sur une loi ou une résolution, tous articles réunis.'
    );
    expect(categoryHelp('article-unique')).toBe(
      "Le texte ne compte qu'un article : le vote porte sur cet article."
    );
    expect(categoryHelp('article-unique')).not.toMatch(/vaut vote/);
    expect(categoryHelp('censure')).toBe('Les députés votent pour renverser le Gouvernement.');
    for (const id of [
      'texte',
      'resolution',
      'article-unique',
      'censure',
      'confiance',
      'declaration',
      'rejet-prealable',
      'partie-budget',
    ] as const) {
      expect(categoryHelp(id).length).toBeGreaterThan(20);
    }
  });

  it('should name the type of vote briefly, and explain it in the details', () => {
    expect(voteTypeLabel('SPS')).toBe('Vote solennel');
    expect(voteTypeLabel('SPO')).toBe('Vote public');
    expect(voteTypeLabel('MOC')).toBe('Motion de censure');
    expect(voteTypeDetail('SPS')).toBe(
      "Vote solennel : annoncé à l'avance, sur un texte important"
    );
    expect(voteTypeDetail('SPO')).toBe('Vote public : le choix de chaque député est publié');
  });

  it('should only capitalize the first letter of the official title, never rewrite it', () => {
    expect(
      capitalizeTitle("l'ensemble du projet de loi d'urgence pour Mayotte (première lecture).")
    ).toBe("L'ensemble du projet de loi d'urgence pour Mayotte (première lecture).");
    expect(capitalizeTitle('la motion de censure')).toBe('La motion de censure');
  });

  it('should say adopted or rejected, in the feminine for a motion', () => {
    expect(resultLabel(scrutinFactory({ adopte: true }))).toBe('Adopté');
    expect(resultLabel(scrutinFactory({ adopte: false }))).toBe('Rejeté');
    expect(resultLabel(scrutinFactory({ type: 'MOC', adopte: false }))).toBe('Rejetée');
    expect(resultLabel(scrutinFactory({ type: 'MOC', adopte: true }))).toBe('Adoptée');
  });

  it('should keep the number as a small reference, and the long date for breadcrumbs', () => {
    expect(scrutinReference(580)).toBe('Scrutin n° 580');
    expect(scrutinHeading(scrutinFactory({ numero: 580, date: '2025-01-22' }))).toBe(
      'Scrutin n° 580 du 22 janvier 2025'
    );
  });

  it('should show for, against and abstentions, and for a censure motion the votes for against the votes needed', () => {
    const synthese = { ...scrutinFactory().synthese, pour: 446, contre: 2, requis: 225 };
    expect(countsLabel(scrutinFactory({ synthese }))).toBe('446 pour · 2 contre · 1 abstention');
    expect(
      countsLabel(
        scrutinFactory({ synthese: { ...synthese, pour: 152, contre: 5, abstentions: 110 } })
      )
    ).toBe('152 pour · 5 contre · 110 abstentions');
    expect(
      countsLabel(
        scrutinFactory({ synthese: { ...synthese, pour: 0, contre: 458, abstentions: 2 } })
      )
    ).toBe('0 pour · 458 contre · 2 abstentions');
    expect(
      countsLabel(
        scrutinFactory({ type: 'MOC', synthese: { ...synthese, pour: 132, requis: 289 } })
      )
    ).toBe('132 pour · 289 nécessaires');
  });

  it('should split the official requesters, which the source separates with line breaks', () => {
    expect(requesters('Président du groupe "A"\rPrésidente du groupe "B"')).toEqual([
      'Président du groupe "A"',
      'Présidente du groupe "B"',
    ]);
    expect(requesters(null)).toEqual([]);
  });

  it('should say in a few words what the Conférence des présidents is', () => {
    expect(requesters('Conférence des Présidents')).toEqual([
      "Conférence des Présidents (réunion qui organise les travaux de l'Assemblée)",
    ]);
  });
});
