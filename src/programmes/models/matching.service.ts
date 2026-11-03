import type { AxisId, Party, Question, Stance } from '@/src/programmes/models/programme.model';

export type AnswerValue = Stance | null;

export interface Answer {
  /** null : « Pas d'avis », la question est ignorée. */
  value: AnswerValue;
  important: boolean;
}

export type Answers = Record<string, Answer>;

/** En dessous, la proximité n'est pas calculée : trop peu de questions comparables. */
export const MIN_COMPARED = 5;

export interface PartyProximity {
  partyId: string;
  /** 0 à 100, ou null si moins de MIN_COMPARED questions comparables. */
  score: number | null;
  /** Nombre de questions réellement comparées (réponse utilisateur ET position du parti connues). */
  comparedCount: number;
}

const MAX_GAP = 4;

/** Proximité 0-100 entre l'utilisateur et un parti, sur les questions comparables. */
export const computeProximity = (answers: Answers, party: Party): PartyProximity => {
  let weightedAgreement = 0;
  let totalWeight = 0;
  let comparedCount = 0;

  for (const [questionId, answer] of Object.entries(answers)) {
    const partyStance = party.stances[questionId]?.stance ?? null;
    if (answer.value === null || partyStance === null) continue;
    const weight = answer.important ? 2 : 1;
    weightedAgreement += weight * (1 - Math.abs(answer.value - partyStance) / MAX_GAP);
    totalWeight += weight;
    comparedCount += 1;
  }

  return {
    partyId: party.id,
    score:
      comparedCount < MIN_COMPARED ? null : Math.round((weightedAgreement / totalWeight) * 100),
    comparedCount,
  };
};

/** Du plus proche au plus éloigné ; scores non calculables en dernier ; égalités par nom. */
export const rankParties = (answers: Answers, parties: Party[]): PartyProximity[] => {
  const names = new Map(parties.map((p) => [p.id, p.name]));
  return parties
    .map((party) => computeProximity(answers, party))
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        (names.get(a.partyId) ?? '').localeCompare(names.get(b.partyId) ?? '', 'fr')
    );
};

export type AxisPosition = Record<AxisId, number | null>;

/** Position de -1 à +1 sur chaque axe, à partir de valeurs -2…+2 par question. */
export const computeAxisPosition = (
  values: Record<string, AnswerValue>,
  questions: Question[]
): AxisPosition => {
  const sums: Record<AxisId, { total: number; count: number }> = {
    economique: { total: 0, count: 0 },
    societal: { total: 0, count: 0 },
    europe: { total: 0, count: 0 },
  };

  for (const question of questions) {
    const value = values[question.id];
    if (question.axis === null || value === null || value === undefined) continue;
    sums[question.axis].total += (value * question.direction) / 2;
    sums[question.axis].count += 1;
  }

  const average = ({ total, count }: { total: number; count: number }) =>
    count === 0 ? null : Math.round((total / count) * 100) / 100;

  return {
    economique: average(sums.economique),
    societal: average(sums.societal),
    europe: average(sums.europe),
  };
};

export const answersToValues = (answers: Answers): Record<string, AnswerValue> =>
  Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, answer.value]));

export const partyToValues = (party: Party): Record<string, AnswerValue> =>
  Object.fromEntries(Object.entries(party.stances).map(([id, s]) => [id, s.stance]));

/** Questions où l'utilisateur et le parti sont proches (écart ≤ 1) ou opposés (écart ≥ 3). */
export const agreementsWith = (answers: Answers, party: Party, questions: Question[]) => {
  const compared = questions.filter(
    (q) => answers[q.id]?.value != null && party.stances[q.id]?.stance != null
  );
  const gap = (q: Question) => Math.abs(answers[q.id].value! - party.stances[q.id].stance!);
  return {
    agree: compared.filter((q) => gap(q) <= 1),
    disagree: compared.filter((q) => gap(q) >= 3),
  };
};
