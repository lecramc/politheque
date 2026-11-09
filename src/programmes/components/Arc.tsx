import React, { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { paint } from '@/src/core/web/svg-paint';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * L'arc : motif signature, seul instrument de mesure du site (compte à rebours, progression,
 * proximité). Toujours bleu d'action sur piste bleu poudré, jamais aux couleurs d'un parti,
 * et toujours accompagné de sa valeur en clair (children ou accessibilityLabel).
 *
 * Le remplissage s'anime sur le thread UI (strokeDashoffset) : aucun rendu React par image.
 * Au montage il part de 0 ; ensuite, il glisse de l'ancienne valeur à la nouvelle.
 */
export function Arc({
  value,
  size = 140,
  strokeWidth = 12,
  delay = 0,
  animate = true,
  dashedRemainder = false,
  accessibilityLabel,
  children,
}: {
  /** 0 à 1. */
  value: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  /** false : affiché directement à sa valeur (révélation déjà jouée). */
  animate?: boolean;
  /** Partie non comparée en pointillés (ex. questions sans position connue). */
  dashedRemainder?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  const { timing, reduce } = useMotion();
  const target = Math.max(0, Math.min(1, value));
  const progress = useSharedValue(animate && !reduce ? 0 : target);

  useEffect(() => {
    progress.value = withDelay(reduce ? 0 : delay, withTiming(target, timing(duration.reveal)));
  }, [target, delay, reduce, progress, timing]);

  const r = (size - strokeWidth) / 2;
  const cy = r + strokeWidth / 2;
  const d = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`;
  const length = Math.PI * r;
  const height = cy + strokeWidth / 2;

  const fillProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
    // Pas de point résiduel (embout arrondi) quand l'arc est vide.
    strokeOpacity: progress.value > 0.002 ? 1 : 0,
  }));

  return (
    <View
      style={{ width: size, alignItems: 'center' }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={height}>
        <Path
          d={d}
          {...paint({ stroke: colors.tintSoft })}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={
            dashedRemainder ? `${strokeWidth * 0.6} ${strokeWidth * 0.9}` : undefined
          }
        />
        {/* Attribut seul : un `style` sur un composant animé de Reanimated écrase ses props
            animées (le remplissage disparaissait). */}
        <AnimatedPath
          d={d}
          stroke={colors.tint}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${length} ${length}`}
          animatedProps={fillProps}
        />
      </Svg>
      {children ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
