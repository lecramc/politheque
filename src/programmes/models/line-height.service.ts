/**
 * Interligne par défaut d'un texte sans `lineHeight` explicite, selon sa taille : aéré pour le
 * texte courant (x1,5 jusqu'à 18 px), resserré pour les titres (x1,25 dès 22 px), intermédiaire
 * entre les deux. Le texte de 16 px donne 24 px.
 */
export const lineHeightFor = (fontSize: number): number => {
  const ratio = fontSize <= 18 ? 1.5 : fontSize >= 22 ? 1.25 : 1.35;
  return Math.round(fontSize * ratio);
};
