// Calculs de couleur purs (WCAG, CIE76), partagés par l'Assemblée et les pastilles de parti.

const channels = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const linear = (channel: number): number => {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Rapport de contraste WCAG entre deux couleurs `#RRGGBB`. */
export const contrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const lab = (hex: string): [number, number, number] => {
  const [r, g, b] = channels(hex).map(linear);
  const x = 0.4124 * r + 0.3576 * g + 0.1805 * b;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = 0.0193 * r + 0.1192 * g + 0.9505 * b;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(x / 0.95047), f(y), f(z / 1.08883)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

/** Distance de couleur CIE76 (ΔE) entre deux couleurs `#RRGGBB` : 0 identiques, 100 noir/blanc. */
export const colorDistance = (a: string, b: string): number => {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

/** Sous ce rapport de contraste (WCAG), une couleur se confond avec son fond. */
export const LOW_CONTRAST = 1.8;

/**
 * Faut-il un contour plus marqué autour d'une marque de couleur officielle ? Oui si, sur l'un des
 * fonds (clair ou sombre), son contraste est sous `LOW_CONTRAST`. La couleur elle-même ne change jamais.
 */
export const needsStrongOutline = (color: string, backgrounds: readonly string[]): boolean =>
  backgrounds.some((background) => contrastRatio(color, background) < LOW_CONTRAST);
