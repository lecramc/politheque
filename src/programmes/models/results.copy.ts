/** Phrases de la page de résultats (présentation du classement). Textes fixes, testés. */

const joinNames = (names: string[]) =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;

export const marginSentence = (margin: number) =>
  `Les pourcentages sont arrondis et approximatifs : un écart de moins de ± ${margin} points ne permet pas de départager deux partis.`;

/** À partir de ce nombre de partis dans la marge, on ne les énumère plus et on ne les départage plus. */
export const BROAD_GROUP_SIZE = 4;

export const BROAD_GROUP_POINTER =
  'Pour comparer ces partis question par question, ouvrez « Question par question » plus bas.';

export const leadGroupSentence = (names: string[], margin: number) =>
  names.length >= BROAD_GROUP_SIZE
    ? `Vos réponses sont proches de ${names.length} partis de sensibilités différentes : aucun ne se détache nettement (écart inférieur à la marge de ± ${margin} points).`
    : names.length > 1
      ? `Vos réponses sont proches de ${names.length} partis, sans qu'on puisse les départager : ${joinNames(names)}. L'écart entre eux est inférieur à la marge de ± ${margin} points.`
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

/** Introduction visible de la page : la consigne de vote reste toujours à l'écran. */
export const RESULTS_INTRO =
  "Proximité entre vos réponses et les positions publiques des partis. Ce n'est pas une consigne de vote.";

/**
 * Les trois rappels de méthode, réunis dans la feuille « Comment lire ces résultats » :
 * `minCompared` réponses comparables pour noter un parti, `margin` points de marge.
 */
export const howToReadBullets = (minCompared: number, margin: number) =>
  [
    `un parti n'est noté que sur au moins ${minCompared} de vos réponses ;`,
    `moins de ${margin} points d’écart : on ne peut pas départager ;`,
    "un parti qui s'exprime peu est comparé sur moins de questions, et son score peut en être gonflé.",
  ] as const;
