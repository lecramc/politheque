import type { AnswerValue, Answers } from '@/src/programmes/models/matching.service';

/**
 * Lien personnel de résultats : les réponses sont encodées dans le FRAGMENT de l'URL
 * (`#r=v2.<code>`). Le fragment n'est jamais envoyé au serveur : rien ne quitte l'appareil.
 *
 * Format : un caractère hexadécimal par question, dans l'ordre FIGÉ de la version
 * (`ANSWER_CODE_V1_IDS`, `ANSWER_CODE_V2_IDS`), et non celui de `questions.ts`, qui peut changer
 * sans casser les liens déjà partagés. Les liens v1 (30 questions) restent lisibles.
 *   état = 0…4 pour −2…+2, 5 pour « pas d'avis », 6 pour « pas répondu » ;
 *   + 7 si la question « compte double » (donc 0…d).
 */
export const ANSWER_CODE_VERSION = 'v2';
export const RESULTS_PATH = '/me-situer/resultats';
const FRAGMENT_KEY = 'r';

/**
 * Ordre figé de la v1 (30 questions), conservé pour lire les liens déjà partagés. Une question
 * ajoutée ou retirée du questionnaire ne modifie pas cette liste.
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

/**
 * Ordre figé de la v2 (31 questions, questionnaire v3) : la v1 sans q23-referendum (retirée),
 * puis q36 et q39. Ajouter une question au code impose une version v3.
 */
const REMOVED_QUESTION_ID = 'q23-referendum';

export const ANSWER_CODE_V2_IDS: readonly string[] = [
  ...ANSWER_CODE_V1_IDS.filter((id) => id !== REMOVED_QUESTION_ID),
  'q36-fonctionnaires',
  'q39-encadrement-loyers',
];

const IDS_BY_VERSION: Record<string, readonly string[]> = {
  v1: ANSWER_CODE_V1_IDS,
  v2: ANSWER_CODE_V2_IDS,
};

const NO_OPINION = 5;
const UNANSWERED = 6;
const IMPORTANT_OFFSET = 7;

const toState = (value: AnswerValue): number => (value === null ? NO_OPINION : value + 2);
const fromState = (state: number): AnswerValue =>
  (state === NO_OPINION ? null : state - 2) as AnswerValue;

export const encodeAnswers = (answers: Answers): string => {
  const code = ANSWER_CODE_V2_IDS.map((id) => {
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
  const ids = IDS_BY_VERSION[code.slice(0, separator)];
  if (!ids) return invalid('version');
  const body = code.slice(separator + 1);
  if (!/^[0-9a-d]+$/.test(body) || body.length !== ids.length) return invalid('invalid');
  const answers: Answers = {};
  ids.forEach((id, index) => {
    const state = parseInt(body[index], 16);
    // q23-referendum (v1) a quitté le questionnaire : sa réponse n'est plus lue.
    if (state === UNANSWERED || id === REMOVED_QUESTION_ID) return;
    const important = state >= IMPORTANT_OFFSET;
    answers[id] = { value: fromState(important ? state - IMPORTANT_OFFSET : state), important };
  });
  return { ok: true, answers };
};

/** Fragment complet (sans le `#`) : `r=v2.<code>`. */
export const buildFragment = (answers: Answers): string =>
  `${FRAGMENT_KEY}=${encodeAnswers(answers)}`;

/** Lien personnel complet, à partir de l'URL du site. */
export const buildPersonalLink = (siteUrl: string, answers: Answers): string =>
  `${siteUrl}${RESULTS_PATH}#${buildFragment(answers)}`;

/** Code `v2.…` (ou `v1.…`) lu dans `location.hash` (`#r=v2.…`), ou null s'il n'y en a pas. */
export const readCodeFromHash = (hash: string): string | null => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get(FRAGMENT_KEY);
};
