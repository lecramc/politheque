import {
  motionCensure,
  spoAmendement,
  spoArticleUniqueLoi,
  spoArticleUniqueResolution,
  spsArticleUniqueResolution,
  spsEnsemble,
} from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import {
  classifyScrutin,
  isUnclassifiedSolemn,
  PERIMETER_RULES,
} from '@/src/assemblee/models/extraction/perimeter';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';

const withTitle = (
  titre: string,
  { type = 'SPO', adopte = true }: { type?: 'SPO' | 'SPS' | 'MOC'; adopte?: boolean } = {}
): RawScrutin => ({
  ...spsEnsemble(),
  typeVote: { codeTypeVote: type },
  sort: { code: adopte ? 'adopté' : 'rejeté' },
  titre,
});

describe('Feature: périmètre — la nature du vote, pas la rédaction du titre', () => {
  it('should include a vote on the whole of a text, whatever the apostrophe and the head of the title', () => {
    expect(classifyScrutin(withTitle('l’ensemble de la proposition de loi X.'))).toMatchObject({
      inclus: true,
      regles: ['R1'],
      categorie: 'texte',
    });
    expect(classifyScrutin(withTitle("L'ensemble du projet de loi X."))).toMatchObject({
      regles: ['R1'],
    });
    expect(classifyScrutin(withTitle("l'ensemble de de la proposition de loi X."))).toMatchObject({
      regles: ['R1'],
    });
  });

  it('should include a vote on a bill whose title does not start with « l’ensemble »', () => {
    expect(
      classifyScrutin(withTitle("le projet de loi autorisant l'approbation d'un accord."))
    ).toMatchObject({
      inclus: true,
      regles: ['R1'],
      categorie: 'texte',
    });
    expect(
      classifyScrutin(withTitle('la proposition de loi organique visant à tester.'))
    ).toMatchObject({
      inclus: true,
      regles: ['R1'],
    });
  });

  it('should include a resolution, whatever the head of the title, in its own category', () => {
    for (const titre of [
      "l'ensemble de la proposition de résolution tendant à tester.",
      'la proposition de résolution visant à abroger la loi X.',
    ]) {
      expect(classifyScrutin(withTitle(titre, { adopte: false }))).toMatchObject({
        inclus: true,
        regles: ['R1'],
        categorie: 'resolution',
      });
    }
  });

  it('should not take a procedure vote for a vote on a text', () => {
    for (const titre of [
      'la proposition du Gouvernement de prolonger la séance en cours (proposition de loi X).',
      'la demande de seconde délibération de l’article unique de la proposition de loi X.',
      'la demande de suspension de séance présentée par M. X (article 58 du règlement).',
      "l'article liminaire du projet de loi de finances pour 2025 (première lecture).",
      "l'amendement n° 12 de M. Untel après l'article 3 du projet de loi (première lecture).",
    ]) {
      expect(classifyScrutin(withTitle(titre)), titre).toMatchObject({ inclus: false, regles: [] });
    }
    expect(classifyScrutin(spoAmendement()).inclus).toBe(false);
  });
});

describe('Feature: périmètre — texte à un seul article', () => {
  it('should include the single article of a bill, a private member bill or a resolution', () => {
    expect(classifyScrutin(spoArticleUniqueLoi())).toMatchObject({
      inclus: true,
      regles: ['R2'],
      categorie: 'article-unique',
    });
    expect(classifyScrutin(spoArticleUniqueResolution())).toMatchObject({
      regles: ['R2'],
      categorie: 'article-unique',
    });
    expect(classifyScrutin(spsArticleUniqueResolution())).toMatchObject({
      regles: ['R2'],
      categorie: 'article-unique',
    });
    expect(
      classifyScrutin(
        withTitle("l'article unique du projet de loi autorisant la ratification d'un traité.")
      ).regles
    ).toEqual(['R2']);
  });
});

describe('Feature: périmètre — motions de censure', () => {
  it('should include every censure motion, from its type', () => {
    expect(classifyScrutin(motionCensure())).toMatchObject({
      inclus: true,
      regles: ['R3'],
      categorie: 'censure',
    });
  });
});

describe('Feature: périmètre — déclarations du Gouvernement', () => {
  it('should tell a vote of confidence (article 49, alinéa 1) from a declaration (article 50-1)', () => {
    expect(
      classifyScrutin(
        withTitle(
          "la déclaration de politique générale du Gouvernement de M. X (application de l'article 49, alinéa premier, de la Constitution).",
          { type: 'SPS', adopte: false }
        )
      )
    ).toMatchObject({ inclus: true, regles: ['R4'], categorie: 'confiance' });
    expect(
      classifyScrutin(
        withTitle(
          "la déclaration du Gouvernement portant sur la stratégie (application de l'article 50-1 de la Constitution).",
          { type: 'SPS' }
        )
      )
    ).toMatchObject({ inclus: true, regles: ['R4'], categorie: 'declaration' });
  });
});

describe('Feature: périmètre — motions de rejet préalable', () => {
  const motion =
    'la motion de rejet préalable, déposée par Mme X, du projet de loi relatif aux comptes (première lecture).';

  it('should include an adopted motion (it rejects the whole text) and exclude a rejected one', () => {
    expect(classifyScrutin(withTitle(motion, { adopte: true }))).toMatchObject({
      inclus: true,
      regles: ['R5'],
      categorie: 'rejet-prealable',
    });
    expect(classifyScrutin(withTitle(motion, { adopte: false }))).toMatchObject({
      inclus: false,
      regles: [],
    });
  });

  it('should read the head of the title through the official misspellings and prefixes', () => {
    expect(
      classifyScrutin(withTitle('sur la motion de rejet préalable, de la proposition de loi X.'))
        .regles
    ).toEqual(['R5']);
    expect(
      classifyScrutin(withTitle('la motion de rejet péalable, de la proposition de loi X.')).regles
    ).toEqual(['R5']);
  });
});

describe('Feature: périmètre — parties des lois financières', () => {
  it('should include every vote on a part of a finance or social security bill, however the title is worded', () => {
    for (const titre of [
      'la première partie du projet de loi de finances pour 2026 (première lecture).',
      "l'ensemble de la deuxième partie du projet de loi de financement de la sécurité sociale pour 2025 (première lecture).",
      'la deuxième partie projet de loi de financement de la sécurité sociale pour 2026 (nouvelle lecture).',
      'la troisième partie du projet de loi de financement de la sécurité sociale pour 2026 (nouvelle lecture).',
      'l’ensemble de la première partie du projet de loi de finances de fin des gestion pour 2024 (première lecture).',
    ]) {
      expect(classifyScrutin(withTitle(titre)), titre).toMatchObject({
        inclus: true,
        regles: ['R6'],
        categorie: 'partie-budget',
      });
    }
  });

  it('should keep a vote on the whole of a finance bill as a vote on a text', () => {
    expect(
      classifyScrutin(
        withTitle(
          "l'ensemble du projet de loi de finances de fin de gestion pour 2024 (texte de la commission mixte paritaire)."
        )
      )
    ).toMatchObject({ regles: ['R1'], categorie: 'texte' });
  });
});

describe('Feature: périmètre — règle écrite, liste fermée', () => {
  it('should publish one sentence per rule, in the order of the rule codes', () => {
    expect(PERIMETER_RULES).toHaveLength(6);
    PERIMETER_RULES.forEach((rule, i) => expect(rule.startsWith(`R${i + 1} : `)).toBe(true));
  });

  it('should report a solemn vote or a motion that no rule recognizes, never silently drop it', () => {
    expect(isUnclassifiedSolemn(withTitle('un objet inattendu.', { type: 'SPS' }))).toBe(true);
    expect(isUnclassifiedSolemn(withTitle('un objet inattendu.', { type: 'SPO' }))).toBe(false);
    expect(isUnclassifiedSolemn(spsEnsemble())).toBe(false);
    expect(isUnclassifiedSolemn(motionCensure())).toBe(false);
  });

  it('should report a title that starts like a whole-text vote but is not in the closed list', () => {
    expect(
      isUnclassifiedSolemn(withTitle("l'ensemble de l'amendement truc.", { type: 'SPO' }))
    ).toBe(true);
  });
});
