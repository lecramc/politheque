import {
  clampFacts,
  parseFacts,
  publicDecision,
  sortNameOf,
} from '@/src/programmes/models/legal/legal-brouillon';

describe('Feature: lecture des dates de faits d’un brouillon', () => {
  it('should read exact dates and intervals, ignoring a trailing comment', () => {
    expect(parseFacts('2004-2016')).toEqual({ start: '2004', end: '2016' });
    expect(parseFacts('2017 (campagne présidentielle)')).toEqual({ start: '2017' });
    expect(parseFacts('2021-10 à 2022-09 (violences d’octobre à décembre 2021)')).toEqual({
      start: '2021-10',
      end: '2022-09',
    });
  });

  it('should bound a decade or a loose period by the years the source gives', () => {
    expect(parseFacts('Années 1990')).toEqual({ start: '1990', end: '1999' });
    expect(parseFacts('Années 1990 à 2013 (détention des avoirs)')).toEqual({
      start: '1990',
      end: '2013',
    });
    expect(parseFacts('Années 2009-2013 (régularisation en 2014)')).toEqual({
      start: '2009',
      end: '2013',
    });
    expect(parseFacts('Fin des années 1980 - début des années 1990 (financement)')).toEqual({
      start: '1980',
      end: '1999',
    });
    expect(parseFacts('Période d’emploi à préciser (législature 2017-2022)')).toEqual({
      start: '2017',
      end: '2022',
    });
  });

  it('should return null when the source gives no year', () => {
    expect(parseFacts(null)).toBeNull();
    expect(parseFacts('Non précisé')).toBeNull();
    expect(parseFacts('Non précisés dans les sources ouvertes (marché du journal)')).toBeNull();
  });
});

describe('Feature: clé de tri d’une personne', () => {
  it('should put the family name first, keeping particles with it', () => {
    expect(sortNameOf('Marine Le Pen', 'personne-physique')).toBe('Le Pen Marine');
    expect(sortNameOf('Jean-Luc Mélenchon', 'personne-physique')).toBe('Mélenchon Jean-Luc');
    expect(sortNameOf('Rassemblement national', 'personne-morale')).toBe('Rassemblement national');
  });
});

describe('Feature: texte public d’une étape tiré du résumé d’un brouillon', () => {
  it('should drop the hand-written presumption notice, which the site generates', () => {
    expect(
      publicDecision("Condamné à un an ; pourvoi en cassation en cours (présomption d'innocence).")
    ).toBe('Condamné à un an ; pourvoi en cassation en cours.');
    expect(
      publicDecision('Appel formé. Il est présumé innocent. Dernière information : mai 2026.')
    ).toBe('Appel formé. Dernière information : mai 2026.');
    expect(
      publicDecision(
        "Il a annoncé un pourvoi et reste présumé innocent jusqu'à la décision définitive."
      )
    ).toBe('Il a annoncé un pourvoi.');
    expect(publicDecision("Dernière information : mai 2026. Présomption d'innocence.")).toBe(
      'Dernière information : mai 2026.'
    );
  });

  it('should write « déclaré coupable », the only accepted form of the word', () => {
    expect(publicDecision('Le RN a été reconnu coupable de recel.')).toBe(
      'Le RN a été déclaré coupable de recel.'
    );
    expect(publicDecision("La cour a déclaré Nicolas Sarkozy coupable d'association.")).toBe(
      "La cour a déclaré coupable Nicolas Sarkozy d'association."
    );
  });
});

describe('Feature: faits antérieurs à la décision', () => {
  it('should not let a loose period of facts end after the decision', () => {
    expect(clampFacts({ start: '1980', end: '1999' }, '1996-05-02')).toEqual({
      start: '1980',
      end: '1996',
    });
    expect(clampFacts({ start: '1996', end: '1999' }, '1996-05-02')).toEqual({ start: '1996' });
    expect(clampFacts({ start: '2004', end: '2016' }, '2025-03-31')).toEqual({
      start: '2004',
      end: '2016',
    });
    expect(clampFacts(null, '2025-03-31')).toBeNull();
  });
});
