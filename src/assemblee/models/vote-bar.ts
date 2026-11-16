import type { BarSegment } from '@/src/assemblee/models/group-table';

export type BarRect = { kind: BarSegment['kind']; x: number; width: number };

/**
 * Géométrie d'une barre empilée : chaque position occupe une largeur proportionnelle à son
 * décompte, côte à côte, dans l'ordre reçu. `threshold` pose un trait (majorité) dans la barre.
 */
export const barLayout = (
  segments: BarSegment[],
  total: number | undefined,
  width: number,
  threshold?: number
): { rects: BarRect[]; mark: number | null } => {
  const whole = total ?? segments.reduce((sum, segment) => sum + segment.count, 0);
  if (whole <= 0) return { rects: [], mark: null };
  let x = 0;
  const rects = segments.map((segment): BarRect => {
    const rect = { kind: segment.kind, x, width: (segment.count / whole) * width };
    x += rect.width;
    return rect;
  });
  const mark =
    threshold === undefined ? null : Math.min(Math.max((threshold / whole) * width, 0), width);
  return { rects, mark };
};
