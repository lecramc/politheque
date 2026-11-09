/**
 * Sommaires « Sur cette page » (débat, méthodologie) : un bloc dans le flux, sous le titre, à
 * toutes les largeurs, plutôt qu'un rail desktop (revue UX du 9 novembre 2026 : pages de moins de
 * deux écrans, un rail collant laisserait une colonne vide). Chaque `id` est le `nativeID` d'une
 * section de l'écran.
 */
export type OnThisPageItem = { id: string; label: string; action?: 'compare' };

export const DEBATE_ANCHORS: OnThisPageItem[] = [
  { id: 'chiffres-cles', label: 'Chiffres clés' },
  { id: 'partis', label: 'Ce que proposent les partis' },
  // Ouvre l'onglet « Comparer deux partis » puis fait défiler jusqu'aux partis.
  { id: 'partis', label: 'Comparer deux partis', action: 'compare' },
  { id: 'aller-plus-loin', label: 'Pour aller plus loin' },
];

export const METHODOLOGY_ANCHORS: OnThisPageItem[] = [
  { id: 'niveaux-de-source', label: 'Les niveaux de source' },
  { id: 'regles', label: 'Nos règles' },
  { id: 'comment-lire', label: 'Comment lire les pages' },
];
