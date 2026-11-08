export type RadioKeyAction = { type: 'choose' } | { type: 'focus'; index: number } | null;

/**
 * Clavier d'un groupe `radiogroup` : Espace choisit l'option qui a le focus, les flèches déplacent
 * le focus (en boucle) sans choisir. Entrée et Tab restent au navigateur.
 */
export const radioKeyAction = (key: string, index: number, count: number): RadioKeyAction => {
  if (key === ' ') return { type: 'choose' };
  if (key === 'ArrowDown' || key === 'ArrowRight')
    return { type: 'focus', index: (index + 1) % count };
  if (key === 'ArrowUp' || key === 'ArrowLeft')
    return { type: 'focus', index: (index - 1 + count) % count };
  return null;
};
