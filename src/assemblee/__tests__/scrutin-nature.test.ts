import index from '@/src/assemblee/data/scrutins-index.json';
import {
  scrutinHelpLinks,
  scrutinNature,
  scrutinShortTitle,
  scrutinStage,
} from '@/src/assemblee/models/scrutin-labels';
import type { ScrutinType } from '@/src/assemblee/models/scrutin.model';
import lexique from '@/src/programmes/data/lexique.json';

const AMENDEMENT =
  "l'amendement n° 749 de M. Jean-Philippe Tanguy après l'article 16 du projet de loi de finances pour 2027 (première lecture).";

describe('Feature: nature du vote tirée du titre officiel', () => {
  it.each([
    [AMENDEMENT, 'Amendement'],
    [
      "l'amendement de suppression n° 1 de Mme Faucillon à l'article unique de la proposition de loi visant à restaurer X (première lecture).",
      'Amendement',
    ],
    [
      "l'article unique de la proposition de loi relative à la sortie des restes (première lecture).",
      'Article',
    ],
    [
      'l’article 15 ter (examen prioritaire) du projet de loi de simplification de la vie économique (première lecture).',
      'Article',
    ],
    [
      "l'ensemble de la proposition de loi visant à lutter contre la vie chère (première lecture).",
      'Texte entier',
    ],
    [
      'l’ensemble de la proposition de loi sur la profession d’infirmier (texte de la commission mixte paritaire).',
      'Texte entier',
    ],
    ["l'ensemble de de la proposition de loi instaurant X.", 'Texte entier'],
    ["le projet de loi autorisant l'approbation de l'accord entre A et B.", 'Texte entier'],
    [
      "la motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution par Mmes A et 56 députés.",
      'Motion de censure',
    ],
    [
      'la motion de rejet préalable, déposée par Mme Panot, du projet de loi portant approbation des comptes (première lecture).',
      'Motion de rejet',
    ],
    [
      'la première partie du projet de loi de finances pour 2027 (première lecture).',
      'Partie du budget',
    ],
    [
      "l'ensemble de la première partie du projet de loi de finances de fin des gestion pour 2024 (première lecture).",
      'Partie du budget',
    ],
    [
      'la deuxième partie projet de loi de financement de la sécurité sociale pour 2026 (nouvelle lecture).',
      'Partie du budget',
    ],
    [
      "la déclaration du Gouvernement portant sur la lutte contre le narcotrafic (application de l'article 50-1 de la Constitution).",
      'Déclaration du Gouvernement',
    ],
    [
      "la déclaration de politique générale du Gouvernement de M. Bayrou (application de l'article 49, alinéa premier, de la Constitution).",
      'Déclaration du Gouvernement',
    ],
  ])('should name %s as %s', (titre, nature) => {
    expect(scrutinNature(titre)).toBe(nature);
  });

  it('should name nothing when no rule applies', () => {
    expect(
      scrutinNature(
        'la proposition de résolution invitant le Gouvernement à agir (article 34-1 de la Constitution).'
      )
    ).toBeNull();
    expect(scrutinNature('un titre inconnu')).toBeNull();
  });

  it('should give a nature to every scrutin of the index except the listed exceptions', () => {
    const without = index.scrutins.filter((s) => scrutinNature(s.titre) === null);
    expect(without.filter((s) => !/^la proposition de résolution/.test(s.titre))).toEqual([]);
    expect(without.length / index.scrutins.length).toBeLessThan(0.1);
  });
});

describe('Feature: étape de la loi', () => {
  it.each([
    ["l'ensemble du projet de loi X (première lecture).", 'première lecture'],
    ["l'ensemble du projet de loi X (deuxième lecture).", 'deuxième lecture'],
    ["l'ensemble du projet de loi X (nouvelle lecture).", 'nouvelle lecture'],
    ["l'ensemble du projet de loi X (lecture définitive).", 'lecture définitive'],
    [
      "l'ensemble du projet de loi X (texte de la commission mixte paritaire).",
      'texte de la commission mixte paritaire',
    ],
  ])('should read the stage of %s', (titre, stage) => {
    expect(scrutinStage(titre)).toBe(stage);
  });

  it('should give no stage when the title does not mention one', () => {
    expect(scrutinStage('la motion de censure déposée par Mme A.')).toBeNull();
    expect(
      scrutinStage('la proposition de résolution X (article 34-1 de la Constitution).')
    ).toBeNull();
  });
});

describe('Feature: titre court', () => {
  it('should shorten an amendment to its number and its text, without the author', () => {
    expect(scrutinShortTitle(AMENDEMENT)).toBe(
      'Amendement n° 749 au projet de loi de finances pour 2027'
    );
  });

  it('should target a proposition de loi with the feminine preposition', () => {
    expect(
      scrutinShortTitle(
        "l'amendement n° 4 de M. Falcon après l'article 6 de la proposition de loi visant à améliorer l'accès (première lecture)."
      )
    ).toBe("Amendement n° 4 à la proposition de loi visant à améliorer l'accès");
  });

  it('should handle a government amendment and identical amendments', () => {
    expect(
      scrutinShortTitle(
        "l'amendement n° 8 (rect.) du Gouvernement au projet de loi de simplification (texte de la commission mixte paritaire)."
      )
    ).toBe('Amendement n° 8 au projet de loi de simplification');
    expect(
      scrutinShortTitle(
        "l'amendement n° 1 de M. Monnet et les amendements identiques suivants de suppression de l'article unique du projet de loi portant X."
      )
    ).toBe('Amendement n° 1 et amendements identiques au projet de loi portant X');
  });

  it('should drop « l’ensemble de » for a whole text, and the stage', () => {
    expect(
      scrutinShortTitle(
        "l'ensemble de la proposition de loi visant à lutter contre la vie chère (première lecture)."
      )
    ).toBe('La proposition de loi visant à lutter contre la vie chère');
    expect(
      scrutinShortTitle('l’ensemble du projet de loi organique relatif au X (première lecture).')
    ).toBe('Le projet de loi organique relatif au X');
  });

  it('should drop the author of a motion', () => {
    expect(
      scrutinShortTitle(
        "la motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution par Mmes A, B et 56 députés."
      )
    ).toBe(
      "Motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution"
    );
    expect(
      scrutinShortTitle(
        'la motion de rejet préalable, déposée par Mme Panot, du projet de loi portant X (première lecture).'
      )
    ).toBe('Motion de rejet préalable du projet de loi portant X');
  });

  it('should keep other titles readable and give nothing without a nature', () => {
    expect(
      scrutinShortTitle(
        'la première partie du projet de loi de finances pour 2027 (première lecture).'
      )
    ).toBe('Première partie du projet de loi de finances pour 2027');
    expect(
      scrutinShortTitle(
        "l'article unique de la proposition de loi relative à X (première lecture)."
      )
    ).toBe('Article unique de la proposition de loi relative à X');
    expect(scrutinShortTitle('la proposition de résolution X.')).toBeNull();
  });

  it('should derive a short title for every named scrutin of the index', () => {
    for (const s of index.scrutins) {
      if (scrutinNature(s.titre) === null) continue;
      const short = scrutinShortTitle(s.titre);
      expect(short, s.titre).not.toBeNull();
      expect(short!.length, s.titre).toBeLessThanOrEqual(s.titre.length + 12);
    }
  });
});

describe('Feature: liens d’aide', () => {
  const ids = new Set(lexique.map((entry: { id: string }) => entry.id));

  it('should always point to the lesson on how a law is voted', () => {
    expect(scrutinHelpLinks({ titre: AMENDEMENT, type: 'SPO' })[0]).toEqual({
      label: 'Comment une loi est votée',
      href: '/comprendre/comment-une-loi-est-votee',
    });
  });

  it('should add lexicon entries by nature, stage and type of vote', () => {
    const hrefs = scrutinHelpLinks({
      titre: "l'ensemble du projet de loi X (texte de la commission mixte paritaire).",
      type: 'SPS',
    }).map((l) => l.href);
    expect(hrefs).toContain('/comprendre/lexique#projet-et-proposition-de-loi');
    expect(hrefs).toContain('/comprendre/lexique#commission-mixte-paritaire');
    expect(hrefs).toContain('/comprendre/lexique#scrutin-public-solennel');
    expect(hrefs).toContain('/comprendre/lexique#abstention');
  });

  it('should explain the motion de censure, which has no abstention', () => {
    const hrefs = scrutinHelpLinks({
      titre: 'la motion de censure déposée par Mme A.',
      type: 'MOC',
    }).map((l) => l.href);
    expect(hrefs).toContain('/comprendre/lexique#motion-de-censure');
    expect(hrefs).not.toContain('/comprendre/lexique#abstention');
  });

  it('should choose the budget entry from the title', () => {
    const of = (titre: string) => scrutinHelpLinks({ titre, type: 'SPO' }).map((l) => l.href);
    expect(
      of('la première partie du projet de loi de finances pour 2027 (première lecture).')
    ).toContain('/comprendre/lexique#loi-de-finances');
    expect(
      of(
        'la troisième partie du projet de loi de financement de la sécurité sociale pour 2026 (nouvelle lecture).'
      )
    ).toContain('/comprendre/lexique#plfss');
  });

  it('should only link to existing lexicon entries', () => {
    for (const s of index.scrutins) {
      for (const link of scrutinHelpLinks({ titre: s.titre, type: s.type as ScrutinType })) {
        if (link.href.includes('#')) expect(ids.has(link.href.split('#')[1])).toBe(true);
      }
    }
  });
});
