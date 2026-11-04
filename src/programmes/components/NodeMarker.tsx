import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, journeySequence, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Icon } from '@/components/Themed';
import { Arc } from '@/src/programmes/components/Arc';
import { Stamp } from '@/src/programmes/components/Stamp';
import type { StepStatus } from '@/src/programmes/models/journey.service';

export const MARKER_WIDTH = 84;
export const MARKER_HEIGHT = 70;
const DISK = 56;
const ARC_STROKE = 8;

/**
 * Marqueur d'une étape : arc de progression (bleu) au-dessus d'un disque-icône.
 * Disque plein = terminée ; contour épais = étape conseillée ; contour fin = les autres.
 * Le badge-tampon (coche) double l'état pour ne pas le porter par la couleur seule.
 */
export function NodeMarker({
  ratio,
  status,
  isNext,
  icon,
  stamped,
  celebrate = false,
  lightUp = false,
}: {
  ratio: number;
  status: StepStatus;
  isNext: boolean;
  icon: string;
  stamped: boolean;
  /** Tampon gagné pendant cette session : il se pose (après l'arc). */
  celebrate?: boolean;
  /** L'étape précédente vient d'être terminée : ce nœud s'éclaire une fois, après le tracé. */
  lightUp?: boolean;
}) {
  const { colors } = useTheme();
  const { reduce, timing } = useMotion();
  const done = status === 'done';
  const lighting = lightUp && isNext && !reduce;
  const light = useSharedValue(lighting ? 0 : 1);
  useLayoutEffect(() => {
    if (!lighting) return;
    light.value = 0;
    light.value = withDelay(journeySequence.nextAt, withTiming(1, timing(duration.open, 'out')));
  }, [lighting]);
  const lightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(light.value, [0, 1], [0.9, 1]),
    borderColor: interpolateColor(
      light.value,
      [0, 1],
      [colors.surface.border.secondary, colors.tint]
    ),
  }));
  return (
    <View style={{ width: MARKER_WIDTH, height: MARKER_HEIGHT }} accessibilityElementsHidden>
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <Arc value={ratio} size={MARKER_WIDTH} strokeWidth={ARC_STROKE} />
      </View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: MARKER_HEIGHT - DISK,
            left: (MARKER_WIDTH - DISK) / 2,
            width: DISK,
            height: DISK,
            borderRadius: DISK / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? colors.tint : colors.surface.primary,
            borderWidth: isNext ? 3 : 1.5,
            borderColor: done
              ? colors.tint
              : isNext
                ? colors.tint
                : status === 'in-progress'
                  ? colors.tintBorder
                  : colors.surface.border.secondary,
          },
          lighting ? lightStyle : null,
        ]}
      >
        <Icon name={icon} variant={done ? 'onColor' : isNext ? 'onGlass' : 'secondary'} />
      </Animated.View>
      {stamped ? (
        <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
          <Stamp
            state="stamped"
            size="badge"
            animateIn={celebrate}
            delay={journeySequence.traceAt}
          />
        </View>
      ) : null}
    </View>
  );
}
