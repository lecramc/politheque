import type { Groupe } from '@/src/assemblee/models/scrutin.model';

/**
 * Couleur de l'arc des groupes : un seul gris neutre pour tous, en clair comme en sombre. Les
 * couleurs officielles de l'Assemblée restent dans les données (c'est la source) mais ne
 * s'affichent nulle part : un traitement égal pour tous les groupes, sans règle de contraste qui
 * en colorerait certains et pas d'autres. Les groupes se lisent par leur abréviation et par les
 * séparateurs entre arcs.
 */
export const GROUP_ARC_COLOR = { light: '#6B6B6B', dark: '#A8A8A8' } as const;

/** Fonds les plus défavorables de chaque thème (crème soutenu, bleu nuit élevé). */
export const GROUP_COLOR_BACKGROUNDS = { light: '#F6F2EA', dark: '#161E33' } as const;

/** Toujours la même couleur : la couleur officielle du groupe n'est jamais utilisée. */
export const groupArcColor = (
  _groupe: Pick<Groupe, 'couleurOfficielle'>,
  theme: 'light' | 'dark'
): string => GROUP_ARC_COLOR[theme];

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
