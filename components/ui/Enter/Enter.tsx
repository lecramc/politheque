import React, { ReactNode, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  cssEasing,
  duration as durations,
  enterKeyframes,
  EnterKind,
  isStaticFirstRender,
  useMotion,
} from '@/components/motion';

/**
 * Enter — joue une entrée courte au montage (fondu, montée, glissement).
 * Changer la `key` du parent rejoue l'entrée (changement d'onglet, de question).
 * Mouvement réduit : aucun déplacement ; `reducedFade` garde un fondu court.
 */
export function Enter({
  kind = 'fade',
  duration = durations.open,
  delay = 0,
  reducedFade = false,
  style,
  children,
}: {
  kind?: EnterKind;
  duration?: number;
  delay?: number;
  /** En mouvement réduit, conserver un fondu court au lieu de rien. */
  reducedFade?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const { reduce } = useMotion();
  // Rendu issu du HTML statique : déjà visible, on ne le rejoue pas (pas de contenu délavé).
  const [fromStatic] = useState(isStaticFirstRender);
  const animation = fromStatic
    ? null
    : reduce
      ? reducedFade
        ? {
            animationName: enterKeyframes.fade,
            animationDuration: 120,
            animationTimingFunction: cssEasing.out,
          }
        : null
      : {
          animationName: enterKeyframes[kind],
          animationDuration: duration,
          animationDelay: delay,
          animationFillMode: 'backwards' as const,
          animationTimingFunction: cssEasing.out,
        };
  return <Animated.View style={[style, animation]}>{children}</Animated.View>;
}
