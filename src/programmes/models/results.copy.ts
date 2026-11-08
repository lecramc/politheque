/** Phrases de la page de résultats (présentation du classement). Textes fixes, testés. */

const joinNames = (names: string[]) =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;

export const marginSentence = (margin: number) =>
  `Les pourcentages sont arrondis et approximatifs : un écart de moins de ± ${margin} points ne permet pas de départager deux partis.`;

export const leadGroupSentence = (names: string[], margin: number) =>
  names.length > 1
    ? `Vos réponses sont proches de ${joinNames(names)}, sans qu'on puisse les départager : l'écart entre eux est inférieur à la marge de ± ${margin} points.`
    : `${names[0]} se détache : son avance sur les autres partis dépasse la marge de ± ${margin} points.`;

export const fewComparedNote = (unknownCount: number) =>
  `Position inconnue sur ${unknownCount} de vos réponses : le score porte sur moins de sujets et peut paraître plus élevé.`;

export const TIED_LABEL = 'à égalité';

/**
 * Trois phrases de la méthodologie : la marge, les positions inconnues, la réponse « Neutre ».
 * `questionCount` : taille du questionnaire du catalogue, jamais écrite en dur.
 */
export const methodSentences = (questionCount: number) =>
  [
    `La marge : un écart de moins de ± 5 points entre deux partis (davantage si vous avez répondu à moins de ${questionCount} questions) n'est pas significatif ; ces partis forment un groupe de tête et ne sont pas départagés.`,
    'Les positions inconnues : une question sans position connue pour un parti est ignorée pour ce parti, qui est alors comparé sur moins de sujets ; cela peut gonfler son score.',
    "La réponse « Neutre » compte comme une position (0) et rapproche des partis dont la position est modérée ; « Je ne sais pas / pas d'avis » écarte la question du calcul pour tous les partis.",
  ] as const;

/** Questionnaire terminé (tampon) mais réponses absentes de la mémoire : jamais « Pas encore de réponses ». */
export const ANSWERS_NOT_KEPT =
  'Vos réponses ne sont pas conservées : refaites le questionnaire ou ouvrez votre lien de résultats.';
