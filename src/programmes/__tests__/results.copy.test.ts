import {
  BROAD_GROUP_POINTER,
  BROAD_GROUP_SIZE,
  fewComparedNote,
  leadGroupSentence,
  methodSentences,
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

  it('should not list the parties when four or more are in the margin', () => {
    const sentence = leadGroupSentence(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 9);
    expect(sentence).toBe(
      'Vos réponses sont proches de 7 partis de sensibilités différentes : aucun ne se détache nettement (écart inférieur à la marge de ± 9 points).'
    );
    expect(sentence).not.toContain('A,');
    expect(leadGroupSentence(['A', 'B', 'C', 'D'], 5)).toContain('proches de 4 partis');
  });

  it('should point to the map and detail tabs when too many parties are in the margin', () => {
    expect(BROAD_GROUP_POINTER).toContain('« Ma carte »');
    expect(BROAD_GROUP_POINTER).toContain('« Détail »');
  });

  it('should switch to the broad presentation from four parties', () => {
    expect(BROAD_GROUP_SIZE).toBe(4);
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
    const sentences = methodSentences(31);
    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toContain('± 5 points');
    expect(sentences[1]).toContain('positions inconnues');
    expect(sentences[2]).toContain('« Neutre »');
  });

  it('should derive the size of the questionnaire in the margin sentence', () => {
    expect(methodSentences(31)[0]).toContain('moins de 31 questions');
    expect(methodSentences(34)[0]).toContain('moins de 34 questions');
  });
});
