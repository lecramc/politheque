import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { groupColor } from '@/src/assemblee/models/group-color';
import { groupName } from '@/src/assemblee/models/group-table';
import { orderGroupes } from '@/src/assemblee/models/groupe-order';
import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import {
  hemicycleArcs,
  hemicycleBox,
  type ArcSegment,
  type HemicycleBox,
} from '@/src/assemblee/models/hemicycle-scene';
import type { Composition, Groupe } from '@/src/assemblee/models/scrutin.model';

/** Sièges de l'Assemblée nationale (constant) et seuil de la majorité absolue. */
export const TOTAL_SEATS = 577;
export const ABSOLUTE_MAJORITY = 289;

export type CompositionRow = {
  /** Indice du groupe dans l'index. */
  index: number;
  abrev: string;
  /** Couleur officielle du groupe à l'Assemblée. */
  color: string;
  libelle: string;
  /** « Nom (SIGLE) » : le même gabarit pour tous les groupes. */
  name: string;
  sieges: number;
  /** « 88 sièges ». */
  seatsLabel: string;
};

export type CompositionSummary = {
  /** De la gauche à la droite de l'hémicycle ; aucun autre classement. */
  rows: CompositionRow[];
  total: number;
  majority: string;
  /** Une seule règle : un groupe a-t-il 289 sièges ou plus ? */
  sentence: string;
  /** Sièges non pourvus dans les données, à part ; `null` quand il n'y en a pas. */
  vacant: string | null;
};

export const compositionSummary = (
  composition: Composition,
  groupes: Groupe[]
): CompositionSummary => {
  const seats = new Map(composition.sieges);
  const copy = COPY.overview.sitting;
  const rows = orderGroupes(groupes, 'places')
    .filter((groupe) => (seats.get(groupe.index) ?? 0) > 0)
    .map((groupe): CompositionRow => {
      const sieges = seats.get(groupe.index)!;
      return {
        index: groupe.index,
        abrev: groupe.abrev,
        color: groupColor(groupe),
        libelle: groupe.libelle,
        name: groupName(groupe),
        sieges,
        seatsLabel: copy.seats(sieges),
      };
    });
  const largest = rows.reduce<CompositionRow | null>(
    (best, row) => (best === null || row.sieges > best.sieges ? row : best),
    null
  );
  const vacant = Math.max(0, TOTAL_SEATS - composition.total);
  return {
    rows,
    total: composition.total,
    majority: copy.majority(ABSOLUTE_MAJORITY),
    sentence:
      largest && largest.sieges >= ABSOLUTE_MAJORITY
        ? copy.hasMajority(largest.name, largest.sieges)
        : copy.noMajority(largest?.sieges ?? 0),
    vacant: vacant > 0 ? copy.vacant(vacant) : null,
  };
};

export type CompositionSeat = {
  place: number;
  x: number;
  y: number;
  angle: number;
  groupe: number;
  /** Couleur officielle du groupe à l'Assemblée. */
  color: string;
};

export type CompositionScene = {
  layout: ReturnType<typeof hemicycleLayout>;
  box: HemicycleBox;
  compactBox: HemicycleBox;
  seats: CompositionSeat[];
  arcs: ArcSegment[];
};

/**
 * Schéma de la composition actuelle : les sièges, numérotés de la droite vers la gauche, sont remplis
 * groupe après groupe (le dernier de la liste en premier). Pas de plan exact : le même dessin et les
 * mêmes arcs que l'hémicycle d'un vote, sans position individuelle.
 */
export const compositionScene = (rows: CompositionRow[], groupes: Groupe[]): CompositionScene => {
  const byPlace = [...rows].reverse().flatMap((row) => Array<number>(row.sieges).fill(row.index));
  const places = byPlace.map((_, i) => i + 1);
  const layout = hemicycleLayout(places);
  return {
    layout,
    box: hemicycleBox(layout),
    compactBox: hemicycleBox(layout, { labels: false }),
    seats: layout.seats.map((seat) => ({
      place: seat.place,
      x: seat.x,
      y: seat.y,
      angle: seat.angle,
      groupe: byPlace[seat.place - 1],
      color: groupColor(groupes[byPlace[seat.place - 1]]),
    })),
    arcs: hemicycleArcs(layout, { places, groupes: byPlace }, groupes),
  };
};
