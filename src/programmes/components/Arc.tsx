import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import { useAnimatedNumber } from '@/src/programmes/components/useAnimatedNumber';

/**
 * L'arc : motif signature, seul instrument de mesure du site (compte à rebours, progression,
 * proximité). Toujours bleu d'action sur piste bleu poudré, jamais aux couleurs d'un parti,
 * et toujours accompagné de sa valeur en clair (children ou accessibilityLabel).
 */
export function Arc({
  value,
  size = 140,
  strokeWidth = 12,
  delay = 0,
  dashedRemainder = false,
  accessibilityLabel,
  children,
}: {
  /** 0 à 1. */
  value: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  /** Partie non comparée en pointillés (ex. questions sans position connue). */
  dashedRemainder?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  const animated = useAnimatedNumber(Math.max(0, Math.min(1, value)), 550, delay);
  const r = (size - strokeWidth) / 2;
  const cy = r + strokeWidth / 2;
  const d = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`;
  const length = Math.PI * r;
  const height = cy + strokeWidth / 2;

  return (
    <View
      style={{ width: size, alignItems: 'center' }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={height}>
        <Path
          d={d}
          stroke={colors.tintSoft}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={
            dashedRemainder ? `${strokeWidth * 0.6} ${strokeWidth * 0.9}` : undefined
          }
        />
        {animated > 0.001 ? (
          <Path
            d={d}
            stroke={colors.tint}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${length * animated} ${length}`}
          />
        ) : null}
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
