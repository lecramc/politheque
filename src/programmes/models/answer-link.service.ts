import type { AnswerValue, Answers } from '@/src/programmes/models/matching.service';

/**
 * Lien personnel de résultats : les réponses sont encodées dans le FRAGMENT de l'URL
 * (`#r=v1.<code>`). Le fragment n'est jamais envoyé au serveur : rien ne quitte l'appareil.
 *
 * Format v1 : un caractère hexadécimal par question, dans l'ordre FIGÉ de `ANSWER_CODE_V1_IDS`
 * (et non celui de `questions.ts`, qui peut changer sans casser les liens déjà partagés).
 *   état = 0…4 pour −2…+2, 5 pour « pas d'avis », 6 pour « pas répondu » ;
 *   + 7 si la question « compte double » (donc 0…d).
 */
export const ANSWER_CODE_VERSION = 'v1';
export const RESULTS_PATH = '/me-situer/resultats';
const FRAGMENT_KEY = 'r';

/**
 * Ordre figé de la v1. Une question ajoutée ou retirée du questionnaire ne modifie pas cette liste :
 * ajouter une question au code impose une version v2.
 */
export const ANSWER_CODE_V1_IDS: readonly string[] = [
  'q01-isf',
  'q02-depenses',
  'q25-successions',
  'q26-nationalisations',
  'q28-prix-energie',
  'q04-retraite',
  'q05-smic',
  'q06-chomage',
  'q27-temps-de-travail',
  'q07-immigration',
  'q08-preference',
  'q09-regularisation',
  'q10-peines-planchers',
  'q29-cannabis',
  'q34-mineurs',
  'q12-nucleaire',
  'q13-renouvelables',
  'q14-normes-agricoles',
  'q30-zfe',
  'q15-medecins',
  'q16-fin-de-vie',
  'q17-ecole-privee',
  'q18-ukraine',
  'q19-droit-europeen',
  'q20-defense-europe',
  'q32-ukraine-ue',
  'q33-veto-europeen',
  'q23-referendum',
  'q24-proportionnelle',
  'q31-voile-sport',
];

const NO_OPINION = 5;
const UNANSWERED = 6;
const IMPORTANT_OFFSET = 7;

const toState = (value: AnswerValue): number => (value === null ? NO_OPINION : value + 2);
const fromState = (state: number): AnswerValue =>
  (state === NO_OPINION ? null : state - 2) as AnswerValue;

export const encodeAnswers = (answers: Answers): string => {
  const code = ANSWER_CODE_V1_IDS.map((id) => {
    const answer = answers[id];
    if (!answer) return UNANSWERED.toString(16);
    return (toState(answer.value) + (answer.important ? IMPORTANT_OFFSET : 0)).toString(16);
  }).join('');
  return `${ANSWER_CODE_VERSION}.${code}`;
};

export type DecodeResult =
  | { ok: true; answers: Answers }
  | { ok: false; reason: 'version' | 'invalid'; message: string };

/** Message neutre : il ne dit rien des réponses et n'accuse personne. */
export const INVALID_LINK_MESSAGE =
  "Ce lien de résultats n'a pas pu être lu : il est incomplet ou d'une autre version. Vous pouvez refaire le questionnaire.";

const invalid = (reason: 'version' | 'invalid'): DecodeResult => ({
  ok: false,
  reason,
  message: INVALID_LINK_MESSAGE,
});

export const decodeAnswers = (code: string): DecodeResult => {
  const separator = code.indexOf('.');
  if (separator === -1) return invalid('invalid');
  if (code.slice(0, separator) !== ANSWER_CODE_VERSION) return invalid('version');
  const body = code.slice(separator + 1);
  if (!/^[0-9a-d]+$/.test(body) || body.length !== ANSWER_CODE_V1_IDS.length) {
    return invalid('invalid');
  }
  const answers: Answers = {};
  ANSWER_CODE_V1_IDS.forEach((id, index) => {
    const state = parseInt(body[index], 16);
    if (state === UNANSWERED) return;
    const important = state >= IMPORTANT_OFFSET;
    answers[id] = { value: fromState(important ? state - IMPORTANT_OFFSET : state), important };
  });
  return { ok: true, answers };
};

/** Fragment complet (sans le `#`) : `r=v1.<code>`. */
export const buildFragment = (answers: Answers): string =>
  `${FRAGMENT_KEY}=${encodeAnswers(answers)}`;

/** Lien personnel complet, à partir de l'URL du site. */
export const buildPersonalLink = (siteUrl: string, answers: Answers): string =>
  `${siteUrl}${RESULTS_PATH}#${buildFragment(answers)}`;

/** Code `v1.…` lu dans `location.hash` (`#r=v1.…`), ou null s'il n'y en a pas. */
export const readCodeFromHash = (hash: string): string | null => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get(FRAGMENT_KEY);
};
