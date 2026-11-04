/* global document */
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  Easing,
  ReduceMotion,
  useReducedMotion,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

/**
 * Tokens de mouvement : seul endroit où vivent les durées, courbes et ressorts.
 * Principes : rapide et doux, ease-out pour les entrées, ease-in pour les sorties,
 * aucun rebond visible, rien ne bouge en boucle (sauf le squelette de chargement).
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
const BEZIER = {
  /** Entrées : démarre vite, se pose en douceur. */
  out: [0.22, 1, 0.36, 1],
  /** Sorties : part doucement, accélère. */
  in: [0.4, 0, 1, 1],
  /** Déplacements d'un point à un autre (onglet, arc de la barre). */
  inOut: [0.65, 0, 0.35, 1],
} as const;

export type Curve = keyof typeof BEZIER;

/** Courbes pour withTiming (thread UI). */
export const easing: Record<Curve, ReturnType<typeof Easing.bezier>> = {
  out: Easing.bezier(...BEZIER.out),
  in: Easing.bezier(...BEZIER.in),
  inOut: Easing.bezier(...BEZIER.inOut),
};

/** Mêmes courbes pour les transitions et animations CSS de reanimated. */
const css = (points: readonly number[]) => `cubic-bezier(${points.join(', ')})`;
export const cssEasing = {
  out: css(BEZIER.out),
  in: css(BEZIER.in),
  inOut: css(BEZIER.inOut),
};

/** Ressorts amortis, sans dépassement. */
export const spring = {
  /** Relâchement d'un geste (feuille qu'on lâche). */
  settle: { damping: 28, stiffness: 320, mass: 1, overshootClamping: true },
} satisfies Record<string, WithSpringConfig>;

/** Appui : léger enfoncement + opacité. */
export const press = { scale: 0.97, scaleLarge: 0.985, opacity: 0.86 } as const;

/**
 * Séquence du parcours citoyen (retour sur l'accueil après une étape terminée) :
 * arc 550 ms, puis tracé 300 ms ‖ tampon 220 ms, puis nœud suivant 220 ms = 1 070 ms.
 */
export const journeySequence = {
  /** Début du tracé et du tampon : une fois l'arc rempli. */
  traceAt: duration.reveal,
  /** Début de l'éclairage du nœud suivant : fin du tracé. */
  nextAt: duration.reveal + duration.trace,
  /** Début de l'arrivée du logo (légèrement avant la fin du tracé : reste sous `sequence`). */
  arrivalAt: duration.reveal + duration.trace / 2,
  /** Décalage entre deux demi-disques du logo. */
  arrivalStagger: 120,
  /** Fin de la séquence complète. */
  end: duration.reveal + duration.trace + duration.open,
  /** Fin de l'arrivée : trois demi-disques en séquence. */
  arrivalEnd: duration.reveal + duration.trace / 2 + 2 * 120 + duration.arrival,
} as const;

/** Décalages (px) des entrées. */
export const offset = { page: 8, question: 24 } as const;

/**
 * Accès aux tokens en respectant « réduire les animations » :
 * en mouvement réduit, les durées tombent à 0 (états finaux immédiats).
 */
export function useMotion() {
  const reduce = useReducedMotion();
  return useMemo(
    () => ({
      reduce,
      /** Durée effective (0 en mouvement réduit). */
      ms: (value: number) => (reduce ? 0 : value),
      /** Configuration withTiming prête à l'emploi. */
      timing: (value: number, curve: Curve = 'out'): WithTimingConfig => ({
        duration: reduce ? 0 : value,
        easing: easing[curve],
        reduceMotion: ReduceMotion.Never,
      }),
    }),
    [reduce]
  );
}

/* -------------------------------------------------------------------------- */
/* Focus clavier visible (web) : l'anneau n'apparaît qu'en navigation clavier. */

let keyboardModality = false;
const listeners = new Set<(value: boolean) => void>();
let installed = false;

function installModalityListeners() {
  if (installed || Platform.OS !== 'web' || typeof document === 'undefined') return;
  installed = true;
  const set = (value: boolean) => {
    if (keyboardModality === value) return;
    keyboardModality = value;
    listeners.forEach((listener) => listener(value));
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key.startsWith('Arrow')) set(true);
  });
  document.addEventListener('pointerdown', () => set(false), true);
}

/** Vrai quand l'utilisateur navigue au clavier (web uniquement). */
export function useKeyboardModality() {
  const [value, setValue] = useState(keyboardModality);
  useEffect(() => {
    installModalityListeners();
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

/* -------------------------------------------------------------------------- */
/* Entrées (animations CSS reanimated : rien n'est masqué tant que JS n'a pas tourné). */

export const enterKeyframes = {
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  rise: {
    from: { opacity: 0, transform: [{ translateY: offset.page }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  fromRight: {
    from: { opacity: 0, transform: [{ translateX: offset.question }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },
  fromLeft: {
    from: { opacity: 0, transform: [{ translateX: -offset.question }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },
} as const;

export type EnterKind = keyof typeof enterKeyframes;
