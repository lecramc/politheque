import React, { useState } from 'react';
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { layout as siteLayout } from '@/components/layout';
import { useTheme } from '@/components/ThemeContext';
import type { CompositionScene } from '@/src/assemblee/models/composition';
import { GROUP_ARC_COLOR } from '@/src/assemblee/models/group-color';
import { paint } from '@/src/core/web/svg-paint';

/** Taille des abréviations de groupe, en pixels réels (le schéma est mis à l'échelle). */
const LABEL_PX = 12;
const NARROW_BELOW = siteLayout.breakpoint.md;

/**
 * Hémicycle de la composition actuelle : mêmes sièges, mêmes arcs gris neutres et mêmes
 * abréviations que l'hémicycle d'un vote, tous les groupes traités de la même façon. Une image
 * pour les technologies d'assistance ; la liste sous le schéma en est l'alternative complète.
 */
export function CompositionChart({ scene, label }: { scene: CompositionScene; label: string }) {
  const { colors, fonts, theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const compact = screenWidth < NARROW_BELOW;
  const box = compact ? scene.compactBox : scene.box;
  const [width, setWidth] = useState(343);
  const onLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.width > 0) setWidth(e.nativeEvent.layout.width);
  };
  const labelSize = LABEL_PX * (box.width / width);

  return (
    <View
      role="img"
      aria-label={label}
      onLayout={onLayout}
      style={{ width: '100%', aspectRatio: box.ratio }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`${box.minX} ${box.minY} ${box.width} ${box.height}`}
      >
        <G>
          {scene.seats.map((seat) => (
            <Circle
              key={seat.place}
              cx={seat.x}
              cy={seat.y}
              r={scene.layout.seatRadius * 0.9}
              {...paint({ fill: colors.text.secondary })}
            />
          ))}
        </G>
        {scene.arcs.map((arc) => (
          <G key={arc.groupe}>
            <Path
              d={arc.path}
              fill="none"
              strokeWidth={0.035}
              strokeLinecap="butt"
              {...paint({ stroke: GROUP_ARC_COLOR[theme] })}
            />
            {compact ? null : (
              <SvgText
                x={arc.labelX}
                y={arc.labelY}
                fontSize={labelSize}
                fontFamily={fonts.medium.fontFamily}
                textAnchor={arc.labelAnchor}
                alignmentBaseline="middle"
                {...paint({ fill: colors.text.primary })}
              >
                {arc.abrev}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}
