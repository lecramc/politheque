// components/ThemedNavigationThemes.ts

import { theme } from './ThemeContext';

// La navigation attend { fontFamily, fontWeight } pour quatre graisses.
const navigationFonts = {
  regular: { ...theme.fonts.regular, fontWeight: '400' as const },
  medium: { ...theme.fonts.medium, fontWeight: '400' as const },
  bold: { ...theme.fonts.bold, fontWeight: '700' as const },
  heavy: { ...theme.fonts.heavy, fontWeight: '700' as const },
};

export const ThemedDefaultTheme = {
  dark: false,
  colors: {
    primary: theme.light.tint,
    background: theme.light.background.primary,
    card: theme.light.surface.primary,
    text: theme.light.text.primary,
    border: theme.light.surface.border.primary,
    notification: theme.light.accent.info,
  },
  fonts: navigationFonts,
};

export const ThemedDarkTheme = {
  dark: true,
  colors: {
    primary: theme.dark.tint,
    background: theme.dark.background.primary,
    card: theme.dark.surface.primary,
    text: theme.dark.text.primary,
    border: theme.dark.surface.border.primary,
    notification: theme.dark.accent.info,
  },
  fonts: navigationFonts,
};
