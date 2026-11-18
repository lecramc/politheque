import { contrastRatio } from '@/src/core/utils/color-contrast';

const LIGHT_TEXT = '#FFFFFF';
const DARK_TEXT = '#111111';

/** Couleur d'initiale (blanc ou quasi-noir) au meilleur contraste WCAG sur la couleur du parti. */
export const initialTextColor = (background: string): string =>
  contrastRatio(background, LIGHT_TEXT) >= contrastRatio(background, DARK_TEXT)
    ? LIGHT_TEXT
    : DARK_TEXT;
