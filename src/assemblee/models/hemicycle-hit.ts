import type { HemicycleSeat } from '@/src/assemblee/models/hemicycle-layout';
import type { ArcSegment, HemicycleBox } from '@/src/assemblee/models/hemicycle-scene';

export type Hit =
  | { kind: 'seat'; place: number }
  | { kind: 'arc'; groupe: number }
  | { kind: 'group'; groupe: number }
  | null;
export type HitScene = {
  box: HemicycleBox;
  seats: HemicycleSeat[];
  seatRadius: number;
  arcs: ArcSegment[];
  /** Indice du groupe du siège (null : siège vacant ou député sans groupe identifiable). */
  groupOf: (place: number) => number | null;
};
export type PointerKind = 'fine' | 'coarse';

/** Du pixel dans le dessin aux coordonnées du schéma (le dessin remplit son cadre). */
export const pixelToModel = (
  box: HemicycleBox,
  size: { width: number; height: number },
  px: number,
  py: number
) => ({
  x: box.minX + (px / size.width) * box.width,
  y: box.minY + (py / size.height) * box.height,
});

/** Zone de l'arc : épaisseur du trait et de son libellé, assez large pour un doigt. */
const ARC_BAND_INNER = 0.07;
const ARC_BAND_OUTER = 0.3;
/** Distance maximale à un siège, en rayons de siège (pointeur fin seulement). */
const SEAT_REACH = 1.6;
/** Rayon d'un appui du doigt, en unités du schéma (un doigt couvre une quarantaine de pixels). */
const TOUCH_REACH = 0.3;

/**
 * Ce qui se trouve sous le pointeur. Un pointeur fin (souris) trouve un siège, ou un segment
 * d'arc. Un doigt ne vise pas un siège : il obtient le groupe du siège le plus proche.
 */
export const hitTest = (
  scene: HitScene,
  point: { x: number; y: number },
  pointer: PointerKind
): Hit => {
  const { box } = scene;
  if (pointer === 'coarse') {
    let nearest: { groupe: number; distance: number } | null = null;
    for (const seat of scene.seats) {
      const groupe = scene.groupOf(seat.place);
      const distance = Math.hypot(seat.x - point.x, seat.y - point.y);
      if (groupe !== null && distance <= TOUCH_REACH && (!nearest || distance < nearest.distance)) {
        nearest = { groupe, distance };
      }
    }
    return nearest ? { kind: 'group', groupe: nearest.groupe } : null;
  }
  if (pointer === 'fine') {
    let best: { place: number; distance: number } | null = null;
    for (const seat of scene.seats) {
      const distance = Math.hypot(seat.x - point.x, seat.y - point.y);
      if (distance <= scene.seatRadius * SEAT_REACH && (!best || distance < best.distance)) {
        best = { place: seat.place, distance };
      }
    }
    if (best) return { kind: 'seat', place: best.place };
  }
  const dx = point.x - box.cx;
  const dy = box.cy - point.y;
  const radius = Math.hypot(dx, dy);
  if (radius < box.arcRadius - ARC_BAND_INNER || radius > box.arcRadius + ARC_BAND_OUTER)
    return null;
  const angle = Math.atan2(dy, dx);
  if (angle < 0) return null;
  const arc = scene.arcs.find((a) => angle >= a.start && angle <= a.end);
  return arc ? { kind: 'arc', groupe: arc.groupe } : null;
};
