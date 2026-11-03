import React from 'react';
import { DimensionValue, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';

const PULSE = { from: { opacity: 1 }, to: { opacity: 0.5 } };

/** Squelette sobre d'une page : blocs crème qui pulsent doucement (fixes en mouvement réduit). */
export function PageSkeleton() {
  const { colors, effects } = useTheme();
  const { reduce } = useMotion();
  const block = (width: DimensionValue, height: number, radius = 8) => ({
    width,
    height,
    borderRadius: radius,
    backgroundColor: colors.surface.border.primary,
  });
  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement"
      style={[
        { gap: effects.spacing.lg },
        reduce
          ? null
          : {
              animationName: PULSE,
              animationDuration: duration.skeleton,
              animationDirection: 'alternate',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
      ]}
    >
      <View style={{ gap: 10 }}>
        <View style={block('35%', 14)} />
        <View style={block('70%', 30)} />
        <View style={block('90%', 16)} />
        <View style={block('60%', 16)} />
      </View>
      <View style={block('100%', 120, effects.borderRadius.small)} />
      <View style={block('100%', 88, effects.borderRadius.small)} />
      <View style={block('100%', 88, effects.borderRadius.small)} />
    </Animated.View>
  );
}
