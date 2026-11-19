import { useWindowDimensions } from 'react-native';

import { layout as siteLayout } from '@/components/layout';
import { useHydrated } from '@/src/core/hooks/useHydrated';

/** Largeur de lecture maximale (colonne du site) et gouttières, pour estimer la largeur du schéma. */
const MAX_WIDTH = 768;
const GUTTERS = 32;

/**
 * Schéma serré (téléphone) ou large (ordinateur). Le rendu statique et l'hydratation partent de la
 * même valeur constante (large, 768 px) : le choix de l'appareil n'intervient qu'après
 * l'hydratation. `estimatedWidth` sert de largeur tant que `onLayout` n'a rien mesuré, pour que la
 * taille des étiquettes reste juste même sans mesure.
 */
export const useCompactChart = () => {
  const hydrated = useHydrated();
  const { width: screenWidth } = useWindowDimensions();
  const compact = hydrated && screenWidth < siteLayout.breakpoint.md;
  const estimatedWidth = hydrated
    ? Math.max(280, Math.min(screenWidth - GUTTERS, MAX_WIDTH))
    : MAX_WIDTH;
  return { compact, estimatedWidth };
};
