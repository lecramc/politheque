import {
  fewComparedNote,
  leadGroupSentence,
  METHOD_SENTENCES,
  marginSentence,
} from '@/src/programmes/models/results.copy';

describe('Feature: phrases de la page de résultats', () => {
  it('should state the margin in points', () => {
    expect(marginSentence(5)).toContain('± 5 points');
  });

  it('should name the leading group without separating its members', () => {
    expect(leadGroupSentence(['PS', 'Les Écologistes'], 5)).toBe(
      "Vos réponses sont proches de PS et Les Écologistes, sans qu'on puisse les départager : l'écart entre eux est inférieur à la marge de ± 5 points."
    );
    expect(leadGroupSentence(['A', 'B', 'C'], 7)).toContain('A, B et C');
  });

  it('should say when a single party stands out', () => {
    expect(leadGroupSentence(['RN'], 5)).toBe(
      'RN se détache : son avance sur les autres partis dépasse la marge de ± 5 points.'
    );
  });

  it('should warn that fewer compared topics can inflate the score', () => {
    expect(fewComparedNote(7)).toBe(
      'Position inconnue sur 7 de vos réponses : le score porte sur moins de sujets et peut paraître plus élevé.'
    );
    expect(fewComparedNote(1)).toContain('sur 1 de vos réponses');
  });

  it('should give the methodology three sentences: margin, unknown positions, neutral answer', () => {
    expect(METHOD_SENTENCES).toHaveLength(3);
    expect(METHOD_SENTENCES[0]).toContain('± 5 points');
    expect(METHOD_SENTENCES[1]).toContain('positions inconnues');
    expect(METHOD_SENTENCES[2]).toContain('« Neutre »');
  });
});
