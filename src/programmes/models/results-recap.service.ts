import { describeLean } from '@/src/programmes/models/axis-explanation.service';
import {
  MIN_AXIS_COUNT,
  type AnswerValue,
  type AxisPosition,
} from '@/src/programmes/models/matching.service';
import { leanText } from '@/src/programmes/models/presentation.service';
import type { Axis } from '@/src/programmes/models/programme.model';

export const MAILTO_SUBJECT = 'Mes résultats Polithèque';
/** Au-delà, certains clients de messagerie tronquent ou refusent le lien mailto:. */
export const MAILTO_MAX_LENGTH = 1800;

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** Date du jour en toutes lettres, en heure locale de l'appareil (« 8 novembre 2026 »). */
export const formatLongDate = (date: Date): string => {
  const day = date.getDate();
  return `${day === 1 ? '1er' : day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const ANSWER_LABEL: Record<string, string> = {
  '2': "Tout à fait d'accord",
  '1': "Plutôt d'accord",
  '0': 'Neutre',
  '-1': "Plutôt pas d'accord",
  '-2': "Pas du tout d'accord",
  null: "Pas d'avis",
};

/** Réponse de l'utilisateur en mots ; `undefined` : la question n'a pas reçu de réponse. */
export const answerLabel = (value: AnswerValue | undefined): string =>
  value === undefined ? 'Pas de réponse' : ANSWER_LABEL[String(value)];

export const METHOD_REMINDER =
  'Proximité avec les positions publiques des partis, pas une consigne de vote.';
export const LINK_WARNING =
  'Ce lien contient vos réponses : ne le partagez qu’avec qui vous voulez.';

export interface RecapInput {
  date: Date;
  /** Déjà classé : du plus proche au plus éloigné, scores non calculables en dernier. */
  ranking: { name: string; score: number | null; comparedCount: number }[];
  axes: Axis[];
  userPosition: AxisPosition;
  link: string;
}

const questions = (count: number) =>
  `${count} question${count > 1 ? 's' : ''} comparée${count > 1 ? 's' : ''}`;

export const buildRecapBody = ({ date, ranking, axes, userPosition, link }: RecapInput): string => {
  const scored = ranking.filter((r) => r.score !== null);
  const unscored = ranking.filter((r) => r.score === null);
  const axisLines = axes.map((axis) => {
    const position = userPosition[axis.id];
    return position === null
      ? `${axis.label} : non placé (moins de ${MIN_AXIS_COUNT} réponses sur cet axe)`
      : `${axis.label} : ${leanText(describeLean({ position, count: 0 }), axis)}`;
  });
  return [
    `Mes résultats Polithèque du ${formatLongDate(date)}`,
    METHOD_REMINDER,
    '',
    'Proximités :',
    ...scored.map((r) => `${r.name} : ${r.score} % (${questions(r.comparedCount)})`),
    ...unscored.map((r) => `${r.name} : non calculable (${questions(r.comparedCount)})`),
    '',
    'Ma position sur les axes :',
    ...axisLines,
    '',
    'Mon lien personnel :',
    link,
    LINK_WARNING,
  ].join('\n');
};

/** `mailto:` sans destinataire : c'est la messagerie de l'utilisateur qui écrit et envoie. */
export const buildMailto = (input: RecapInput): string =>
  `mailto:?subject=${encodeURIComponent(MAILTO_SUBJECT)}&body=${encodeURIComponent(buildRecapBody(input))}`;
