/**
 * Tokens de mise en page : source unique, lue par les styles React Native et par la feuille
 * CSS responsive du web (`src/core/web/layout-css.ts`). Voir docs/ux/spec-desktop.md §3.
 */
export const layout = {
  breakpoint: { md: 768, lg: 1024, xl: 1200 },
  /** Contenu : largeur max partagée par l'en-tête, le contenu et le pied de page. */
  container: 1120,
  /** Marge latérale : mobile / md / lg. */
  gutter: { base: 20, md: 32, lg: 40 },
  /** Colonne gauche collante : lg / xl. */
  rail: { lg: 264, xl: 296 },
  railGap: { lg: 40, xl: 56 },
  /** Colonne principale : xl / sous xl. */
  main: { xl: 768, lg: 656 },
  /** Largeur max d'un paragraphe (environ 75 signes). */
  measure: 680,
  /** Colonne unique centrée de 768 à 1023. */
  single: 720,
  /**
   * Cellule fixe du badge de position : >= 768 / sous 768 (tableaux de partis). 148 et non 132 :
   * « Pas de position » (15 px) mesure environ 110 px et la cellule garde 32 px pour le rond.
   */
  stanceCell: { md: 152, base: 148 },
  railTop: 20,
} as const;

export type Layout = typeof layout;
