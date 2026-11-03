import * as SystemUI from 'expo-system-ui';
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';

export const theme = {
  // Direction « Fusion » (Rangées + Demi-cocarde) — voir docs/direction-fusion.html.
  // Règles : tricolore.* uniquement dans Logo et Tricolore ; pastel.rose uniquement dans le trio
  // pastel ; jamais de couleur de parti en aplat ; accent.success / error interdits pour une
  // position politique (pour / contre = tint + symbole + libellé).
  light: {
    background: {
      default: '#F6F2EA', // canevas (crème soutenu)
      primary: '#FFFFFF', // barre de navigation, zones élevées
      secondary: '#FBF8F3', // fond des écrans : crème
      tertiary: '#F5F1EA', // blocs de contraste, séparateurs épais
      player: '#000000',
    },
    surface: {
      primary: '#FFFFFF', // cartes, cernées de border.primary, sans ombre
      secondary: '#F5F1EA', // cartes discrètes
      tertiary: '#DCE6F4', // bleu poudré : encarts, puces, choix sélectionné
      glass: 'rgba(255, 255, 255, 0.72)',
      transparent: 'transparent',
      disabled: 'rgba(21, 32, 58, 0.08)',
      hover: 'rgba(30, 63, 143, 0.06)', // survol web des zones cliquables sans bordure
      border: {
        primary: '#E8E2D8',
        secondary: '#D9D1C4',
        tertiary: '#7C8394', // contour des contrôles : 3,58:1 sur crème
        glass: 'rgba(21, 32, 58, 0.08)',
        transparent: 'transparent',
        hover: {
          primary: '#D9D1C4',
          secondary: '#BFB6A8',
          tertiary: '#5F6779',
          glass: 'rgba(21, 32, 58, 0.12)',
        },
      },
    },
    text: {
      primary: '#15203A', // 15,3:1 sur crème
      secondary: '#4B5468', // 7,2:1 sur crème
      strong: '#0B1328',
      disabled: 'rgba(21, 32, 58, 0.38)',
      onColor: '#FFFFFF',
      glass: '#15203A',
      glassSecondary: '#4B5468',
    },
    shadow: { color: 'rgba(21, 32, 58, 0.06)', elevation: 4 },
    tint: '#1E3F8F', // bleu nuit d'action : 9,2:1 sur crème
    tintSoft: '#DCE6F4',
    tintBorder: '#A9BDE0',
    ctaGradient: ['#1E3F8F', '#2A4FA6'] as [string, string],
    tabIconDefault: '#6B7385',
    tabIconSelected: '#1E3F8F',
    tabIndicator: '#DCE6F4',
    accent: {
      success: '#2D6A4F',
      warning: '#8A5300',
      error: '#A3261D',
      info: '#1E3F8F',
    },
    pastel: { bleu: '#DCE6F4', creme: '#FBF8F3', rose: '#F6E1DE' },
    tricolore: { bleu: '#1E3F8F', blanc: '#FFFFFF', rouge: '#D2394A', contourBlanc: '#7C8394' },
  },

  dark: {
    background: {
      default: '#0A0F1C',
      primary: '#161E33',
      secondary: '#0E1424',
      tertiary: '#1C2540',
      player: '#000000',
    },
    surface: {
      primary: '#161E33',
      secondary: '#1C2540',
      tertiary: '#1F2C4D', // bleu poudré nocturne
      glass: 'rgba(22, 30, 51, 0.72)',
      transparent: 'transparent',
      disabled: 'rgba(244, 242, 237, 0.08)',
      hover: 'rgba(157, 183, 242, 0.1)',
      border: {
        primary: '#29334D',
        secondary: '#34405E',
        tertiary: '#8A93A8',
        glass: 'rgba(244, 242, 237, 0.08)',
        transparent: 'transparent',
        hover: {
          primary: '#34405E',
          secondary: '#45527A',
          tertiary: '#A3ABBE',
          glass: 'rgba(244, 242, 237, 0.12)',
        },
      },
    },
    text: {
      primary: '#F4F2ED',
      secondary: '#B8BFCE',
      strong: '#FFFFFF',
      disabled: 'rgba(244, 242, 237, 0.38)',
      onColor: '#0E1424', // texte sur bouton bleu clair
      glass: '#FFFFFF',
      glassSecondary: 'rgba(255, 255, 255, 0.72)',
    },
    shadow: { color: 'rgba(0, 0, 0, 0.35)', elevation: 8 },
    tint: '#9DB7F2',
    tintSoft: '#1F2C4D',
    tintBorder: '#3A4E80',
    ctaGradient: ['#9DB7F2', '#AFC4F5'] as [string, string],
    tabIconDefault: '#8A93A8',
    tabIconSelected: '#9DB7F2',
    tabIndicator: '#1F2C4D',
    accent: {
      success: '#7CC6A0',
      warning: '#E8B055',
      error: '#F08A80',
      info: '#9DB7F2',
    },
    pastel: { bleu: '#1F2C4D', creme: '#0E1424', rose: '#3A2530' },
    tricolore: { bleu: '#6F8FE0', blanc: '#F4F2ED', rouge: '#E27783', contourBlanc: '#8A93A8' },
  },

  effects: {
    blur: 25,
    // Standard states (tactile feedback / disabled) — use everywhere instead
    // of diverging hardcoded values (0.45/0.5/0.6).
    opacity: {
      disabled: 0.5,
      pressed: 0.7,
    },
    borderRadius: {
      xs: 8, // small thumbnails / chips
      small: 14,
      medium: 14,
      large: 28,
      round: 100,
      input: 16, // standalone input (DateInput, TimeInput, ThemedTextInput alone)
      inputGrouped: 10, // input inside a grouped section (iOS Form/Section style)
    },
    spacing: {
      none: 0,
      xxs: 3,
      xs: 6,
      sm: 12,
      smd: 16, // standard iOS content margin (8 pt grid)
      md: 20,
      lg: 28,
      xl: 36,
      xxl: 48,
    },
    // Elevation scale (subtle iOS-style shadows). Combine with
    // shadowColor: colors.shadow.color. Replaces diverging shadowOpacity values.
    shadow: {
      sm: { shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 0.06 },
      md: { shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 0.1 },
      lg: { shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 0.16 },
    },
    sizes: {
      icon: {
        small: 18,
        medium: 22,
        large: 28,
        xlarge: 36,
      },
      button: {
        small: 40,
        medium: 48,
        large: 54,
        full: `${100}%`,
        fit: 'fit-content',
        text: {
          small: 17, // Math.round(40 * 0.43)
          medium: 21, // Math.round(48 * 0.43)
          large: 23, // Math.round(54 * 0.43)
        },
      },
      text: {
        micro: 10,
        tiny: 11,
        paragraph: 16,
        title: 28,
        subtitle: 18,
        caption: 14,
        body: 16,
        quote: 24,
        label: 13,
        secondary: 15,
        display: 22,
        hero: 34, // Large Title iOS — large numbers (timeline dates, stats)
      },
      input: { sm: 40, md: 48, lg: 54 },
      row: { sm: 44, md: 54, lg: 64 },
    },
  },

  // Atkinson Hyperlegible (texte, conçue pour la basse vision) + Fraunces (titres ≥ 22 px).
  // Atkinson n'existe qu'en 400 et 700 : les graisses intermédiaires s'y rabattent.
  fonts: {
    regular: { fontFamily: 'AtkinsonHyperlegible_400Regular' },
    medium: { fontFamily: 'AtkinsonHyperlegible_400Regular' },
    semibold: { fontFamily: 'AtkinsonHyperlegible_700Bold' },
    bold: { fontFamily: 'AtkinsonHyperlegible_700Bold' },
    light: { fontFamily: 'AtkinsonHyperlegible_400Regular' },
    thin: { fontFamily: 'AtkinsonHyperlegible_400Regular' },
    heavy: { fontFamily: 'AtkinsonHyperlegible_700Bold' },
    italic: { fontFamily: 'AtkinsonHyperlegible_400Regular_Italic' },
    display: { fontFamily: 'Fraunces_600SemiBold' },
    displayBold: { fontFamily: 'Fraunces_700Bold' },
  },
};

export type Theme = typeof theme;

interface ThemeContextProps {
  theme: ThemeType;
  systemTheme: ThemeType;
  colors: typeof theme.light | typeof theme.dark;
  /** Kept as an alias of `colors`: the app follows the OS only, so the two never diverge. */
  systemColors: typeof theme.light | typeof theme.dark;
  effects: typeof theme.effects;
  fonts: typeof theme.fonts;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProviderCustom = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const resolvedSystemTheme: ThemeType = systemColorScheme === 'dark' ? 'dark' : 'light';

  // The app follows the OS appearance only — there is no in-app theme toggle.
  // This guarantees `colors` and `systemColors` are always identical, so content
  // on native surfaces (BottomSheet, pickers) can never desync from the app theme.
  const colors = useMemo(() => theme[resolvedSystemTheme], [resolvedSystemTheme]);
  const effects = theme.effects;
  const fonts = theme.fonts;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background.default).catch(() => {});
  }, [colors.background.default]);

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedSystemTheme,
        systemTheme: resolvedSystemTheme,
        colors,
        systemColors: colors,
        effects,
        fonts,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProviderCustom');
  return context;
};

// Styles derived from theme tokens. Allows using colors/effects/fonts INSIDE a
// StyleSheet (where the hook is otherwise inaccessible), while keeping memoization
// and re-renders on theme change (light/dark).
export const useThemedStyles = <T extends Record<string, object>>(
  factory: (theme: ThemeContextProps) => T
): T => {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme]);
};
