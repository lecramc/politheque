import * as Haptics from 'expo-haptics';
import React, { useLayoutEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  ReduceMotion,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, easing, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Icon } from '@/components/Themed';

export type StampSize = 'mini' | 'badge' | 'row' | 'cover';

const DIAMETER: Record<StampSize, number> = { mini: 24, badge: 28, row: 40, cover: 72 };
const ICON_SIZE: Record<StampSize, 'small' | 'medium' | 'xlarge'> = {
  mini: 'small',
  badge: 'small',
  row: 'medium',
  cover: 'xlarge',
};

/** Rotation de repos de tous les tampons posés (l'animation d'arrivée part de −10°). */
export const STAMP_REST_ROTATION = '-4deg';
const REST_DEG = -4;
const START_DEG = -10;
const START_SCALE = 1.15;

const haptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
};

/**
 * Tampon du parcours : UN SEUL visuel pour tous les contenus et tous les partis.
 * Volontairement sans prop de couleur (neutralité : un tampon ne dit rien du contenu).
 * Posé : cercle bleu d'action, anneau intérieur pointillé, icône, rotation de repos.
 * Vide : cercle pointillé discret, sans rotation. L'état n'est jamais porté par la couleur
 * seule : posé = coche ou icône, vide = anneau pointillé sans coche.
 */
export function Stamp({
  state,
  size,
  icon,
  accessibilityLabel,
  animateIn = false,
  delay = 0,
}: {
  state: 'stamped' | 'empty';
  size: StampSize;
  /** Nom Ionicons ; par défaut une coche. */
  icon?: string;
  accessibilityLabel?: string;
  /**
   * Le tampon « se pose » une seule fois (échelle 1,15 → 1, rotation −10° → −4°, opacité,
   * `duration.stamp`, haptique légère en natif). À ne passer que pour un tampon gagné pendant la
   * session : jamais à l'hydratation. Mouvement réduit : fondu simple de 150 ms.
   */
  animateIn?: boolean;
  /** Attente avant la pose (ms), ex. le temps que l'arc se remplisse. */
  delay?: number;
}) {
  const { colors } = useTheme();
  const { reduce } = useMotion();
  const playing = animateIn && state === 'stamped';
  const progress = useSharedValue(playing ? 0 : 1);

  // Layout effect : le tampon est masqué avant la première image, sans flash de l'état final.
  useLayoutEffect(() => {
    if (!playing) return;
    progress.value = 0;
    // ReduceMotion.Never explicite : le fondu de 150 ms se joue même en mouvement réduit.
    progress.value = withDelay(
      reduce ? 0 : delay,
      withTiming(
        1,
        {
          duration: reduce ? duration.stampFade : duration.stamp,
          easing: easing.out,
          reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          if (finished && Platform.OS !== 'web') runOnJS(haptic)();
        }
      )
    );
  }, [playing]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (reduce) return { opacity: p, transform: [{ rotate: STAMP_REST_ROTATION }] };
    return {
      opacity: p,
      transform: [
        { scale: interpolate(p, [0, 1], [START_SCALE, 1]) },
        { rotate: `${interpolate(p, [0, 1], [START_DEG, REST_DEG])}deg` },
      ],
    };
  });

  const diameter = DIAMETER[size];
  const stamped = state === 'stamped';
  const glyph = icon ?? 'checkmark';
  return (
    <Animated.View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: stamped ? 2 : 1.5,
          borderStyle: stamped ? 'solid' : 'dashed',
          borderColor: stamped ? colors.tint : colors.text.disabled,
          backgroundColor: stamped ? colors.tintSoft : 'transparent',
          transform: stamped ? [{ rotate: STAMP_REST_ROTATION }] : undefined,
        },
        stamped ? animatedStyle : null,
      ]}
    >
      {stamped && size !== 'mini' ? (
        <View
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            right: 3,
            bottom: 3,
            borderRadius: diameter / 2,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.tintBorder,
          }}
        />
      ) : null}
      {stamped || size === 'cover' ? (
        <Icon name={glyph} variant={stamped ? 'onGlass' : 'secondary'} size={ICON_SIZE[size]} />
      ) : null}
    </Animated.View>
  );
}
