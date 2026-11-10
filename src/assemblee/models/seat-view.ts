import type { HemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import type { Depute, Groupe, ScrutinDetail, VoteCode } from '@/src/assemblee/models/scrutin.model';

/** Forme du siège : la teinte ne porte jamais seule l'information. */
export type SeatGlyph = 'disc' | 'disc-slash' | 'ring' | 'dot' | 'dashed' | 'none';

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

const GLYPHS: Record<VoteCode, SeatGlyph> = {
  P: 'disc',
  C: 'disc-slash',
  A: 'ring',
  N: 'dot',
  '-': 'dashed',
  '.': 'none',
};

const LABELS: Record<VoteCode, string> = {
  P: 'pour',
  C: 'contre',
  A: 'abstention',
  N: 'non-votant',
  '-': 'pas de vote enregistré',
  '.': 'siège vacant',
};

/**
 * Libellé d'une position. Pour une motion de censure l'Assemblée ne recense que les « pour » :
 * les autres députés « n'ont pas voté la motion », jamais « contre » ni « absent ».
 */
export const voteLabel = (vote: VoteCode, options: { censure?: boolean } = {}): string =>
  vote === '-' && options.censure ? "n'a pas voté la motion" : LABELS[vote];

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
      glyph: GLYPHS[vote],
      depute: depute === -1 ? null : nameOf(deputes[depute]),
      groupe: groupe === -1 ? null : groupes[groupe].abrev,
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
    counts.N > 0 && plural(counts.N, 'non-votant'),
    counts['-'] > 0 &&
      (options.censure
        ? `${counts['-']} ${counts['-'] > 1 ? "n'ont" : "n'a"} pas voté la motion`
        : `${counts['-']} sans vote enregistré`),
    counts['.'] > 0 && plural(counts['.'], 'siège vacant', 'sièges vacants'),
  ];
  return parts.filter(Boolean).join(', ');
};
