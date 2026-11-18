import { theme, useTheme } from '@/components/ThemeContext';
import { needsStrongOutline } from '@/src/core/utils/color-contrast';

/** Fonds sur lesquels se posent les marques de couleur : écran et cartes, en clair et en sombre. */
const BACKGROUNDS = [
  theme.light.background.secondary,
  theme.light.surface.primary,
  theme.dark.background.secondary,
  theme.dark.surface.primary,
];

/**
 * Contour d'une marque de couleur officielle (pastille, bande, filet, arc). La couleur ne change
 * jamais ; si elle se confond avec le fond dans l'un des thèmes (voir `needsStrongOutline`), le
 * contour est plus marqué. Indépendant du thème courant : le rendu statique web reste identique.
 */
export const useMarkOutline = (color: string): string => {
  const { colors } = useTheme();
  return needsStrongOutline(color, BACKGROUNDS)
    ? colors.surface.border.hover.tertiary
    : colors.surface.border.tertiary;
};
