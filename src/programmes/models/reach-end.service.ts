/** Part du contenu qui doit avoir défilé à l'écran pour qu'une page soit considérée « lue ». */
export const READ_THROUGH_RATIO = 0.85;

export type ScrollMeasure = { offsetY: number; viewportHeight: number; contentHeight: number };

/**
 * Vrai si (haut de la zone visible + hauteur visible) atteint `ratio` du contenu,
 * ou si le contenu tient sans défiler. Faux tant que rien n'est mesuré.
 */
export function hasReachedEnd(
  { offsetY, viewportHeight, contentHeight }: ScrollMeasure,
  ratio: number = READ_THROUGH_RATIO
): boolean {
  if (viewportHeight <= 0 || contentHeight <= 0) return false;
  if (contentHeight <= viewportHeight) return true;
  return offsetY + viewportHeight >= ratio * contentHeight;
}
