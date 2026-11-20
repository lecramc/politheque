import type { HemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import type { Depute, Groupe, ScrutinDetail, VoteCode } from '@/src/assemblee/models/scrutin.model';
import { STANCE_SCALE_ENTRIES, type ScaleGlyph } from '@/src/programmes/models/stance-scale';

/** Forme du siège : celles de la grammaire pour / contre (`stance-scale.ts`) ; la teinte ne porte jamais seule l'information. */
export type SeatGlyph = ScaleGlyph | 'none';

export type SeatDepute = { id: string; nom: string };

export type SeatView = {
  place: number;
  x: number;
  y: number;
  vote: VoteCode;
  glyph: SeatGlyph;
  depute: SeatDepute | null;
  /** Abréviation officielle du groupe au jour du vote. */
  groupe: string | null;
  /** Indice du groupe dans l'index : distingue deux organes de même abréviation (mise en évidence). */
  groupeIndex: number | null;
  delegation: boolean;
};

export type UnseatedView = {
  depute: SeatDepute;
  groupe: string;
  vote: Exclude<VoteCode, '.'>;
  delegation: boolean;
};

export type SeatViewInput = {
  layout: HemicycleLayout;
  detail: ScrutinDetail;
  deputes: Depute[];
  groupes: Groupe[];
  censure: boolean;
};

/**
 * Une forme par position. « Ne prend pas part au vote » et « n'a pas voté » se dessinent de la
 * même façon (légende à quatre entrées) : seule la forme fusionne, jamais les décomptes.
 */
export const SEAT_GLYPHS: Record<VoteCode, SeatGlyph> = {
  P: STANCE_SCALE_ENTRIES.pour.glyph,
  C: STANCE_SCALE_ENTRIES.contre.glyph,
  A: STANCE_SCALE_ENTRIES.abstention.glyph,
  N: STANCE_SCALE_ENTRIES.absent.glyph,
  '-': STANCE_SCALE_ENTRIES.absent.glyph,
  '.': 'none',
};

const nameOf = (depute: Depute): SeatDepute => ({
  id: depute.id,
  nom: `${depute.prenom} ${depute.nom}`,
});

export const seatViews = (
  input: SeatViewInput
): { seats: SeatView[]; unseated: UnseatedView[] } => {
  const { layout, detail, deputes, groupes } = input;
  const indexOfPlace = new Map(detail.places.map((place, i) => [place, i]));
  const seats = layout.seats.map((seat): SeatView => {
    const i = indexOfPlace.get(seat.place);
    if (i === undefined) throw new Error(`La place ${seat.place} est absente du détail du scrutin`);
    const vote = detail.votes[i] as VoteCode;
    const depute = detail.deputes[i];
    const groupe = detail.groupes[i];
    return {
      place: seat.place,
      x: seat.x,
      y: seat.y,
      vote,
      glyph: SEAT_GLYPHS[vote],
      depute: depute === -1 ? null : nameOf(deputes[depute]),
      groupe: groupe === -1 ? null : groupes[groupe].abrev,
      groupeIndex: groupe === -1 ? null : groupe,
      delegation: detail.delegations.includes(i),
    };
  });
  const unseated = detail.sansPlace.map(
    (m): UnseatedView => ({
      depute: nameOf(deputes[m.depute]),
      groupe: groupes[m.groupe].abrev,
      vote: m.vote,
      delegation: m.delegation,
    })
  );
  return { seats, unseated };
};

const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${n} ${n > 1 ? pluralForm : singular}`;

/** Résumé unique des effectifs, pour l'étiquette accessible de l'hémicycle. */
export const describeVotes = (
  detail: ScrutinDetail,
  options: { censure?: boolean } = {}
): string => {
  const counts: Record<VoteCode, number> = { P: 0, C: 0, A: 0, N: 0, '-': 0, '.': 0 };
  for (const vote of detail.votes) counts[vote as VoteCode] += 1;
  for (const m of detail.sansPlace) counts[m.vote] += 1;
  const parts = [
    counts.P > 0 && `${counts.P} pour`,
    counts.C > 0 && `${counts.C} contre`,
    counts.A > 0 && plural(counts.A, 'abstention'),
    counts.N > 0 &&
      `${counts.N} ${counts.N > 1 ? 'ne prennent pas part' : 'ne prend pas part'} au vote`,
    counts['-'] > 0 &&
      `${counts['-']} ${counts['-'] > 1 ? "n'ont" : "n'a"} pas voté${options.censure ? ' la motion' : ''}`,
    counts['.'] > 0 && plural(counts['.'], 'siège vacant', 'sièges vacants'),
  ];
  return parts.filter(Boolean).join(', ');
};
