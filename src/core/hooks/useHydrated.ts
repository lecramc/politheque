import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * Faux pendant le rendu statique ET pendant l'hydratation (le client rejoue alors le même rendu que
 * le HTML), puis vrai : tout ce qui dépend de l'appareil (police chargée, progression locale)
 * s'affiche après l'hydratation, jamais dans le premier rendu.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
