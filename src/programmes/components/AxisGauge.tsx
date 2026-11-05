import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Only } from '@/src/core/components/Only';
import { PartyDot } from '@/src/programmes/components/PartyDot';

const GEOMETRY = {
  full: { height: 24, pad: 10, track: 6, tick: 1.5, tickFrom: 5, tickTo: 19, dash: '4 4', gap: 2 },
  mini: { height: 14, pad: 5, track: 4, tick: 1, tickFrom: 3, tickTo: 11, dash: '3 3', gap: 1.5 },
} as const;

/** En dessous, la position est considérée nulle : pas de remplissage, marqueur au centre. */
const NEUTRAL_BELOW = 0.02;
const MINI_WIDTH = 56;
const MINI_WIDTH_DESKTOP = 72;
const DEFAULT_FULL_WIDTH = 280;

/**
 * Réglette bipolaire : -1 (pôle négatif, à gauche) → +1 (pôle positif, à droite).
 * Remplissage toujours en `tint` des deux côtés ; la couleur du parti n'apparaît qu'en anneau.
 */
type GaugeProps = {
  /** -1 à +1, null = non placé. */
  position: number | null;
  color: string;
  variant: 'full' | 'mini';
  negativePole?: string;
  positivePole?: string;
  side?: 'negative' | 'positive' | null;
  accessibilityLabel?: string;
};

/**
 * La version `mini` existe en deux largeurs (56 px sous 768 px, 72 px ensuite), toutes deux
 * rendues ; la CSS en masque une, sans lire la largeur de la fenêtre en JavaScript.
 */
export function AxisGauge(props: GaugeProps) {
  if (props.variant === 'mini') {
    return (
      <>
        <Only below="md">
          <Gauge {...props} miniWidth={MINI_WIDTH} />
        </Only>
        <Only from="md">
          <Gauge {...props} miniWidth={MINI_WIDTH_DESKTOP} />
        </Only>
      </>
    );
  }
  return <Gauge {...props} miniWidth={MINI_WIDTH} />;
}

function Gauge({
  position,
  color,
  variant,
  negativePole,
  positivePole,
  side = null,
  accessibilityLabel,
  miniWidth,
}: GaugeProps & { miniWidth: number }) {
  const { colors, effects, fonts } = useTheme();
  const [measured, setMeasured] = useState(DEFAULT_FULL_WIDTH);
  const g = GEOMETRY[variant];
  const full = variant === 'full';
  const width = full ? measured : miniWidth;
  const x = (p: number) => g.pad + ((p + 1) / 2) * (width - 2 * g.pad);
  const mid = x(0);
  const y = g.height / 2;
  const neutral = position !== null && Math.abs(position) < NEUTRAL_BELOW;
  const onLayout = (e: LayoutChangeEvent) => {
    if (full) setMeasured(e.nativeEvent.layout.width);
  };

  const poleStyle = (active: boolean) => ({
    flex: 1,
    fontSize: effects.sizes.text.label,
    lineHeight: 17,
    ...(active ? { ...fonts.bold, color: colors.text.primary } : { color: colors.text.secondary }),
  });

  const hidden = full
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
        'aria-hidden': true,
      };

  return (
    <View onLayout={onLayout} style={full ? undefined : { width }} {...hidden}>
      <View style={{ height: g.height, justifyContent: 'center' }}>
        <Svg width={width} height={g.height}>
          {position === null ? (
            <Line
              x1={g.pad}
              x2={width - g.pad}
              y1={y}
              y2={y}
              stroke={colors.surface.border.tertiary}
              strokeWidth={g.gap}
              strokeDasharray={g.dash}
            />
          ) : (
            <>
              <Line
                x1={g.pad}
                x2={width - g.pad}
                y1={y}
                y2={y}
                stroke={colors.tintSoft}
                strokeWidth={g.track}
                strokeLinecap="round"
              />
              <Line
                x1={mid}
                x2={mid}
                y1={g.tickFrom}
                y2={g.tickTo}
                stroke={colors.surface.border.tertiary}
                strokeWidth={g.tick}
              />
              {!neutral ? (
                <Line
                  x1={mid}
                  x2={x(position)}
                  y1={y}
                  y2={y}
                  stroke={colors.tint}
                  strokeWidth={g.track}
                  strokeLinecap="butt"
                />
              ) : null}
              {!full ? (
                <Circle
                  cx={x(position)}
                  cy={y}
                  r={4.5}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={colors.surface.primary}
                />
              ) : null}
            </>
          )}
        </Svg>
        {full && position !== null ? (
          <View style={{ position: 'absolute', left: x(position) - 9, top: y - 9 }}>
            <PartyDot color={color} size={16} />
          </View>
        ) : null}
      </View>
      {full ? (
        <View
          style={{
            flexDirection: 'row',
            gap: effects.spacing.sm,
            marginTop: effects.spacing.xxs,
          }}
        >
          <Text style={poleStyle(side === 'negative')}>{negativePole}</Text>
          <Text style={[poleStyle(side === 'positive'), { textAlign: 'right' }]}>
            {positivePole}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
