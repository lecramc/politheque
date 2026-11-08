import { createContext } from 'react';

/**
 * Vrai quand une zone cliquable sans marge latérale est survolée : le texte qu'elle contient se
 * souligne (voir `Text`), au lieu de recevoir un fond collé aux lettres.
 */
export const PressableHoverContext = createContext(false);
