import {
  motionCensure,
  spoAmendement,
  spoArticleUniqueLoi,
  spoArticleUniqueResolution,
  spsArticleUniqueResolution,
  spsEnsemble,
} from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import { classifyScrutin } from '@/src/assemblee/models/extraction/perimeter';

describe('Feature: périmètre des scrutins publiés', () => {
  it("should include a vote whose normalized title starts with « l'ensemble », whatever the apostrophe", () => {
    const typographic = { ...spoAmendement(), titre: 'l’ensemble de la proposition de loi X.' };
    const straight = { ...spoAmendement(), titre: "L'ensemble de la proposition de loi X." };
    expect(classifyScrutin(typographic).inclus).toBe(true);
    expect(classifyScrutin(straight).inclus).toBe(true);
  });

  it('should exclude amendments and article votes that are neither solemn nor on the whole text', () => {
    expect(classifyScrutin(spoAmendement())).toMatchObject({ inclus: false, regles: [] });
    expect(classifyScrutin(spoArticleUniqueResolution()).inclus).toBe(false);
  });

  it('should include every solemn vote (SPS) and every censure motion (MOC)', () => {
    expect(classifyScrutin(spsArticleUniqueResolution())).toMatchObject({
      inclus: true,
      regles: ['R2'],
    });
    expect(classifyScrutin(motionCensure())).toMatchObject({ inclus: true, regles: ['R3'] });
  });

  it('should include the single article of a bill or private member bill, never of a resolution', () => {
    expect(classifyScrutin(spoArticleUniqueLoi())).toMatchObject({ inclus: true, regles: ['R4'] });
    const organique = {
      ...spoArticleUniqueLoi(),
      titre: "l'article unique de la proposition de loi organique tendant à tester.",
    };
    expect(classifyScrutin(organique).regles).toEqual(['R4']);
    const projet = {
      ...spoArticleUniqueLoi(),
      titre: "l'article unique du projet de loi autorisant la ratification d'un traité.",
    };
    expect(classifyScrutin(projet).regles).toEqual(['R4']);
  });

  it('should record every rule that matched', () => {
    expect(classifyScrutin(spsEnsemble())).toMatchObject({ regles: ['R1', 'R2'] });
    const spsArticleLoi = {
      ...spsEnsemble(),
      titre: "l'article unique de la proposition de loi X.",
    };
    expect(classifyScrutin(spsArticleLoi).regles).toEqual(['R2', 'R4']);
  });
});

describe('Feature: catégorie d’un scrutin', () => {
  const withTitle = (titre: string, type: 'SPO' | 'SPS' = 'SPS') => ({
    ...spsEnsemble(),
    typeVote: { codeTypeVote: type },
    titre,
  });

  it('should call a censure motion « censure »', () => {
    expect(classifyScrutin(motionCensure()).categorie).toBe('censure');
  });

  it('should derive the category from the title', () => {
    expect(classifyScrutin(spsEnsemble()).categorie).toBe('texte');
    expect(
      classifyScrutin(withTitle('la déclaration du Gouvernement sur X (article 50-1).'))
    ).toMatchObject({
      categorie: 'declaration',
    });
    expect(
      classifyScrutin(withTitle('la déclaration de politique générale du Gouvernement de M. X.'))
        .categorie
    ).toBe('declaration');
    expect(
      classifyScrutin(
        withTitle('la première partie du projet de loi de finances pour 2026 (première lecture).')
      ).categorie
    ).toBe('premiere-partie-budget');
    expect(classifyScrutin(spsArticleUniqueResolution()).categorie).toBe('resolution');
  });

  it('should label a single-article vote on a bill as such', () => {
    expect(classifyScrutin(spoArticleUniqueLoi()).categorie).toBe('article-unique');
  });

  it('should fall back to « autre » for an unrecognized solemn vote', () => {
    expect(classifyScrutin(withTitle('un objet inattendu.')).categorie).toBe('autre');
  });
});
