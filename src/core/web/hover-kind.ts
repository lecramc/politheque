type Box = {
  borderWidth?: number;
  backgroundColor?: unknown;
  padding?: unknown;
  paddingHorizontal?: unknown;
  paddingLeft?: unknown;
  paddingRight?: unknown;
};

export type HoverKind = 'border' | 'surface' | 'text' | 'filled';

const isVisible = (color: unknown) =>
  typeof color === 'string' && color !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(color);

const num = (value: unknown) => (typeof value === 'number' ? value : 0);

const horizontalPadding = (box: Box) =>
  Math.min(
    num(box.paddingLeft ?? box.paddingHorizontal ?? box.padding),
    num(box.paddingRight ?? box.paddingHorizontal ?? box.padding)
  );

/**
 * Forme du survol par défaut (web) d'une zone cliquable, selon sa boîte :
 * - `border` : la bordure se renforce ;
 * - `filled` : la boîte a déjà un fond visible ;
 * - `surface` : transparente mais avec assez de marge latérale pour porter un fond de survol ;
 * - `text` : sans marge latérale (lien, logo), un fond serait collé aux lettres, donc le survol
 *   passe par le soulignement et l'opacité.
 */
export const hoverKind = (box: Box, minPadding: number): HoverKind => {
  if (num(box.borderWidth) > 0) return 'border';
  if (isVisible(box.backgroundColor)) return 'filled';
  return horizontalPadding(box) >= minPadding ? 'surface' : 'text';
};
