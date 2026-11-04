import {
  computeAxisPosition,
  MIN_AXIS_COUNT,
  partyToValues,
} from '@/src/programmes/models/matching.service';
import type {
  AxisId,
  Party,
  PartyStance,
  Question,
  Stance,
} from '@/src/programmes/models/programme.model';

export interface AxisContribution {
  question: Question;
  /** Position du parti (toujours connue : les positions inconnues sont écartées). */
  stance: PartyStance & { stance: Stance };
  /** -1 à +1 : > 0 tire vers le pôle positif de l'axe. */
  contribution: number;
}

export interface AxisExplanation {
  items: AxisContribution[];
  /** Position de -1 à +1, ou null si trop peu de positions connues. */
  position: number | null;
  /** Nombre de positions connues sur cet axe. */
  count: number;
}

const AXIS_IDS: AxisId[] = ['economique', 'societal', 'europe'];

/** Quelles affirmations, et quelles positions, ont servi à placer un parti sur chaque axe. */
export const explainAxisPosition = (
  party: Party,
  questions: Question[]
): Record<AxisId, AxisExplanation> => {
  const positions = computeAxisPosition(partyToValues(party), questions);
  return Object.fromEntries(
    AXIS_IDS.map((axis) => {
      const items = questions.flatMap((question) => {
        const stance = party.stances[question.id];
        if (question.axis !== axis || !stance || stance.stance === null) return [];
        return [
          {
            question,
            stance: stance as AxisContribution['stance'],
            contribution: (stance.stance * question.direction) / 2,
          },
        ];
      });
      return [axis, { items, position: positions[axis], count: items.length }];
    })
  ) as Record<AxisId, AxisExplanation>;
};

export type Lean =
  | {
      kind: 'placed';
      strength: 'centre' | 'plutot' | 'nettement';
      side: 'negative' | 'positive' | null;
    }
  | { kind: 'unplaced'; count: number; minimum: number };

const PLUTOT_FROM = 0.2;
const NETTEMENT_FROM = 0.6;

/** |p| < 0.2 → centre ; 0.2 ≤ |p| < 0.6 → plutôt ; ≥ 0.6 → nettement. Mêmes seuils pour tous. */
export const describeLean = (explanation: Pick<AxisExplanation, 'position' | 'count'>): Lean => {
  const { position } = explanation;
  if (position === null) {
    return { kind: 'unplaced', count: explanation.count, minimum: MIN_AXIS_COUNT };
  }
  const size = Math.abs(position);
  if (size < PLUTOT_FROM) return { kind: 'placed', strength: 'centre', side: null };
  return {
    kind: 'placed',
    strength: size < NETTEMENT_FROM ? 'plutot' : 'nettement',
    side: position < 0 ? 'negative' : 'positive',
  };
};

/** Répartit les affirmations par sens de tirage, en conservant l'ordre du questionnaire. */
export const groupByPull = (items: AxisContribution[]) => ({
  negative: items.filter((i) => i.contribution < 0),
  positive: items.filter((i) => i.contribution > 0),
  neutral: items.filter((i) => i.contribution === 0),
});
