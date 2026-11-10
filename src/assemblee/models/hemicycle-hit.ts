import type { HemicycleSeat } from '@/src/assemblee/models/hemicycle-layout';
import type { ArcSegment, HemicycleBox } from '@/src/assemblee/models/hemicycle-scene';

export type Hit = { kind: 'seat'; place: number } | { kind: 'arc'; groupe: number } | null;
export type HitScene = {
  box: HemicycleBox;
  seats: HemicycleSeat[];
  seatRadius: number;
  arcs: ArcSegment[];
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

/**
 * Ce qui se trouve sous le pointeur. Un pointeur fin (souris) trouve un siège ; un doigt ne le
 * peut pas (les sièges font quelques pixels) et ne trouve qu'un segment d'arc de groupe.
 */
export const hitTest = (
  scene: HitScene,
  point: { x: number; y: number },
  pointer: PointerKind
): Hit => {
  const { box } = scene;
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
