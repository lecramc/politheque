/**
 * Durées et courbes du mouvement, sans dépendance à reanimated : la feuille CSS du web
 * (`src/core/web/layout-css.ts`) les lit aussi. `components/motion.ts` les réexporte.
 */
export const duration = {
  /** Enfoncement à l'appui. */
  press: 90,
  /** Relâchement de l'appui. */
  release: 160,
  hover: 150,
  /** Accordéon, onglets, chevron. */
  open: 220,
  close: 180,
  /** Entrée du contenu d'une page. */
  page: 240,
  /** Feuille qui monte du bas. */
  sheet: 260,
  /** Passage d'une question à l'autre. */
  question: 220,
  /** Retour visuel sur la réponse choisie avant l'avance automatique. */
  choiceFeedback: 250,
  /** Remplissage d'un arc. */
  reveal: 550,
  /** Durée totale maximale d'une révélation en séquence (résultats). */
  sequence: 1200,
  /** Tronçon du chemin qui se trace (parcours citoyen). */
  trace: 300,
  /** Tampon qui se pose. */
  stamp: 220,
  /** Chaque demi-disque du logo à l'arrivée (décalage de 120 ms entre eux). */
  arrival: 160,
  /** Fondu du tampon en mouvement réduit (joué même alors, sans échelle ni rotation). */
  stampFade: 150,
  /** Demi-cycle de pulsation du squelette. */
  skeleton: 900,
} as const;

/** Courbes, en points de contrôle cubic-bezier (partagés entre worklets et CSS). */
export const BEZIER = {
  /** Entrées : démarre vite, se pose en douceur. */
  out: [0.22, 1, 0.36, 1],
  /** Sorties : part doucement, accélère. */
  in: [0.4, 0, 1, 1],
  /** Déplacements d'un point à un autre (onglet, arc de la barre). */
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Mêmes courbes pour les transitions et animations CSS de reanimated. */
const css = (points: readonly number[]) => `cubic-bezier(${points.join(', ')})`;
export const cssEasing = {
  out: css(BEZIER.out),
  in: css(BEZIER.in),
  inOut: css(BEZIER.inOut),
};
