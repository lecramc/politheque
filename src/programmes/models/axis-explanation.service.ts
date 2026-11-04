import { computeAxisPosition, partyToValues } from '@/src/programmes/models/matching.service';
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
