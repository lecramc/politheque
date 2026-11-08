import type { Answers, PartyProximity } from '@/src/programmes/models/matching.service';
import type { Party, Question, Stance } from '@/src/programmes/models/programme.model';

/**
 * Marge (en points de score) sur un questionnaire complet, estimée à 90 % : audit-questionnaire § 3.1.
 * Le « questionnaire complet » est celui du catalogue : sa taille n'est jamais écrite en dur.
 */
const BASE_MARGIN = 5;

/**
 * Marge d'incertitude de l'écart entre deux scores, en points. Elle ne dépend que du nombre de
 * réponses de l'utilisateur et sur la taille du questionnaire : la même pour tous les partis.
 * ±5 sur un questionnaire complet, plus large quand il y a moins de réponses (proportionnelle
 * à 1/√n : environ ±10 avec 8 réponses sur 31).
 */
export const scoreMargin = (answeredCount: number, questionCount: number): number =>
  Math.max(BASE_MARGIN, Math.round(BASE_MARGIN * Math.sqrt(questionCount / answeredCount)));

export interface RankedProximity extends PartyProximity {
  /** Rang « à la compétition » sur le score arrondi (1, 1, 3…), null sans score. */
  rank: number | null;
  /** Au moins un autre parti affiche exactement le même score arrondi. */
  tied: boolean;
}

export interface PresentedRanking {
  items: RankedProximity[];
  margin: number;
  /** Identifiants des partis dont l'écart avec le premier est inférieur à la marge. */
  leaders: string[];
}

/**
 * Prépare le classement à l'affichage. `proximities` est déjà trié sur le score non arrondi.
 * Deux scores arrondis identiques partagent le même rang (« à égalité ») : on ne désigne jamais
 * un « premier » par l'ordre alphabétique.
 */
export const presentRanking = (
  proximities: PartyProximity[],
  answeredCount: number,
  questionCount: number
): PresentedRanking => {
  const margin = scoreMargin(answeredCount, questionCount);
  const scored = proximities.filter((p) => p.score !== null);
  const items = proximities.map((p) => {
    if (p.score === null) return { ...p, rank: null, tied: false };
    const higher = scored.filter((o) => o.score! > p.score!).length;
    const same = scored.filter((o) => o.score === p.score).length;
    return { ...p, rank: higher + 1, tied: same > 1 };
  });
  const first = proximities.find((p) => p.rawScore !== null);
  const leaders = first
    ? proximities
        .filter((p) => p.rawScore !== null && first.rawScore! - p.rawScore! < margin)
        .map((p) => p.partyId)
    : [];
  return { items, margin, leaders };
};

/**
 * Seuil relatif : un parti est « comparé sur peu de sujets » s'il l'est sur moins de 80 % des
 * réponses de l'utilisateur. Son score porte alors sur moins de sujets et peut paraître gonflé.
 */
export const isFewCompared = (comparedCount: number, answeredCount: number): boolean =>
  answeredCount > 0 && comparedCount < answeredCount * 0.8;

export interface SeparatingQuestion {
  question: Question;
  userValue: Stance;
  /** Position de chaque parti de tête qui en a une sur cette question. */
  stances: { partyId: string; stance: Stance }[];
}

/**
 * « Ce qui les départage » : les questions auxquelles l'utilisateur a répondu où les partis de
 * tête s'écartent d'au moins 2 points, les plus partagées d'abord (puis dans l'ordre du
 * questionnaire). Même règle pour tous les partis.
 */
export const separatingQuestions = (
  answers: Answers,
  leaders: Party[],
  questions: Question[],
  limit = 3
): SeparatingQuestion[] => {
  if (leaders.length < 2) return [];
  return questions
    .flatMap((question, order) => {
      const userValue = answers[question.id]?.value;
      if (userValue === null || userValue === undefined) return [];
      const stances = leaders.flatMap((party) => {
        const stance = party.stances[question.id]?.stance;
        return stance === null || stance === undefined ? [] : [{ partyId: party.id, stance }];
      });
      if (stances.length < 2) return [];
      const values = stances.map((s) => s.stance);
      const spread = Math.max(...values) - Math.min(...values);
      return spread >= 2 ? [{ question, userValue, stances, spread, order }] : [];
    })
    .sort((a, b) => b.spread - a.spread || a.order - b.order)
    .slice(0, limit)
    .map(({ question, userValue, stances }) => ({ question, userValue, stances }));
};
