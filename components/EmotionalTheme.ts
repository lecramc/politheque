import { theme, useTheme } from '@/components/ThemeContext';

export interface EmotionalColors {
  background: {
    default: string;
    primary: string;
    clear: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    onColor: string;
    skip: string;
  };
  surface: {
    border: { primary: string };
    skip: { bg: string };
    dot: { inactive: string };
  };
  tint: string;
  tintSoft: string;
  tintBorder: string;
  error: string;
  ctaGradient: [string, string];
  heroGradient: readonly [string, string, string, string];
}

export const EMOTIONAL_DARK: EmotionalColors = {
  background: {
    default: '#07051a',
    primary: '#0c051e',
    clear: 'rgba(7,5,26,0)',
  },
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.48)',
    disabled: 'rgba(255,255,255,0.28)',
    onColor: 'rgba(255,255,255,1)',
    skip: 'rgba(255,255,255,0.40)',
  },
  surface: {
    border: { primary: 'rgba(255,255,255,0.10)' },
    skip: { bg: 'rgba(255,255,255,0.08)' },
    dot: { inactive: 'rgba(255,255,255,0.18)' },
  },
  tint: '#7c4dff',
  tintSoft: 'rgba(124,77,255,0.18)',
  tintBorder: 'rgba(124,77,255,0.35)',
  error: 'rgba(255,107,107,0.92)',
  ctaGradient: ['#7c4dff', '#a06dff'],
  heroGradient: ['#200b46', '#140630', '#0c051e', '#08041a'],
};

export function useEmotionalTheme(): {
  colors: EmotionalColors;
  effects: typeof theme.effects;
  fonts: typeof theme.fonts;
} {
  const { effects, fonts } = useTheme();
  return { colors: EMOTIONAL_DARK, effects, fonts };
}
