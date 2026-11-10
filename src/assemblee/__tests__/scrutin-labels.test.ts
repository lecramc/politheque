import {
  capitalizeTitle,
  categoryLabel,
  countsLabel,
  requesters,
  resultLabel,
  scrutinHeading,
  voteTypeLabel,
} from '@/src/assemblee/models/scrutin-labels';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

describe('Feature: libellés d’un scrutin', () => {
  it('should name every category in plain words', () => {
    expect(categoryLabel('texte')).toBe("Vote sur l'ensemble d'un texte");
    expect(categoryLabel('article-unique')).toBe("Vote sur l'article unique d'un texte");
    expect(categoryLabel('censure')).toBe('Motion de censure');
  });

  it('should name the type of vote', () => {
    expect(voteTypeLabel('SPS')).toBe('Scrutin public solennel');
    expect(voteTypeLabel('SPO')).toBe('Scrutin public ordinaire');
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

  it('should build the heading from the number and the long date', () => {
    expect(scrutinHeading(scrutinFactory({ numero: 580, date: '2025-01-22' }))).toBe(
      'Scrutin n° 580 du 22 janvier 2025'
    );
  });

  it('should show for and against, and for a censure motion only the votes for against the required majority', () => {
    const synthese = { ...scrutinFactory().synthese, pour: 446, contre: 2, requis: 225 };
    expect(countsLabel(scrutinFactory({ synthese }))).toBe('446 pour, 2 contre');
    expect(
      countsLabel(
        scrutinFactory({ type: 'MOC', synthese: { ...synthese, pour: 132, requis: 289 } })
      )
    ).toBe('132 voix pour, 289 requises');
  });

  it('should split the official requesters, which the source separates with line breaks', () => {
    expect(requesters('Président du groupe "A"\rPrésidente du groupe "B"')).toEqual([
      'Président du groupe "A"',
      'Présidente du groupe "B"',
    ]);
    expect(requesters(null)).toEqual([]);
  });
});
