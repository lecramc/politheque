import type { SittingMember } from '@/src/assemblee/models/extraction/amo';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';

export type SeatMember = {
  acteurRef: string;
  groupeRef: string;
  vote: Exclude<VoteCode, '.'>;
  delegation: boolean;
  /** Numéro de place donné par le vote ; null quand l'open data n'en donne pas. */
  place: number | null;
  /** Cause officielle d'un non-vote (`causePositionVote`), quand la source la donne. */
  cause?: string;
};

export type SeatedMember = SeatMember & { place: number };

export type PlaceObservation = { date: string; place: number };
/** Places observées pour chaque député dans les autres scrutins. */
export type SeatHistory = Record<string, PlaceObservation[]>;

const distance = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b));

/** Places candidates d'un député : la plus proche dans le temps d'abord, puis la place du mandat. */
const candidatePlaces = (
  acteurRef: string,
  date: string,
  history: SeatHistory,
  placeHemicycle: number | null
): number[] => {
  const observed = [...(history[acteurRef] ?? [])]
    .sort((a, b) => distance(a.date, date) - distance(b.date, date) || a.place - b.place)
    .map((o) => o.place);
  return [...new Set([...observed, ...(placeHemicycle === null ? [] : [placeHemicycle])])];
};

/**
 * Attribue une place à chaque député du jour. Les votes qui portent un numéro de place sont
 * prioritaires ; les autres (vote sans place, député sans vote enregistré) prennent leur place la
 * plus proche dans le temps, jamais une place déjà occupée. Sans place libre connue, le député est
 * rendu à part : on n'invente pas de siège.
 */
export const assignSeats = (input: {
  date: string;
  voters: SeatMember[];
  absents: Omit<SittingMember, 'alternatives'>[];
  history: SeatHistory;
  /** Place attribuée par le mandat, pour un vote sans numéro de place. */
  hemicyclePlaces?: Record<string, number | null>;
}): { seated: SeatedMember[]; unplaced: SeatMember[] } => {
  const taken = new Set<number>();
  const seated: SeatedMember[] = [];
  const unplaced: SeatMember[] = [];

  for (const voter of input.voters) {
    if (voter.place !== null) {
      taken.add(voter.place);
      seated.push({ ...voter, place: voter.place });
    }
  }

  const placeLater: { member: SeatMember; placeHemicycle: number | null }[] = [
    ...input.voters
      .filter((v) => v.place === null)
      .map((member) => ({
        member,
        placeHemicycle: input.hemicyclePlaces?.[member.acteurRef] ?? null,
      })),
    ...input.absents.map((a) => ({
      member: {
        acteurRef: a.acteurRef,
        groupeRef: a.groupeRef,
        vote: '-' as const,
        delegation: false,
        place: null,
      },
      placeHemicycle: a.placeHemicycle,
    })),
  ];

  for (const { member, placeHemicycle } of placeLater) {
    const place = candidatePlaces(member.acteurRef, input.date, input.history, placeHemicycle).find(
      (p) => !taken.has(p)
    );
    if (place === undefined) {
      unplaced.push(member);
    } else {
      taken.add(place);
      seated.push({ ...member, place });
    }
  }

  return { seated, unplaced };
};

/** Aligne les députés sur l'ensemble des places : une entrée par place, null pour un siège vacant. */
export const fillSeats = (
  universe: number[],
  seated: SeatedMember[]
): { places: number[]; seats: (SeatedMember | null)[] } => {
  const places = [...universe].sort((a, b) => a - b);
  const byPlace = new Map(seated.map((s) => [s.place, s]));
  for (const place of byPlace.keys()) {
    if (!places.includes(place)) throw new Error(`Place ${place} absente de l'ensemble des places`);
  }
  return { places, seats: places.map((p) => byPlace.get(p) ?? null) };
};
