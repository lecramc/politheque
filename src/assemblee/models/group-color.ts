/**
 * Couleur de groupe (couleur officielle de l'Assemblée) sur l'arc extérieur : conservée si elle
 * contraste au moins 3:1 avec le fond (objet graphique, WCAG 1.4.11), sinon gris neutre. Le groupe
 * est toujours nommé en texte à côté : la couleur ne porte jamais seule l'information.
 */
export const GROUP_COLOR_MIN_CONTRAST = 3;
export const GROUP_COLOR_FALLBACK = '#7A8190';

/** Fonds les plus défavorables de chaque thème (crème soutenu, bleu nuit élevé). */
export const GROUP_COLOR_BACKGROUNDS = { light: '#F6F2EA', dark: '#161E33' } as const;

const HEX = /^#([0-9a-f]{6})$/i;

const luminance = (hex: string): number => {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

export const groupColor = (
  official: string,
  background: string
): { color: string; official: boolean } =>
  HEX.test(official) && contrastRatio(official, background) >= GROUP_COLOR_MIN_CONTRAST
    ? { color: official, official: true }
    : { color: GROUP_COLOR_FALLBACK, official: false };
