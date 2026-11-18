import React, { useState } from 'react';
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { layout as siteLayout } from '@/components/layout';
import { useTheme } from '@/components/ThemeContext';
import { GroupArcPath } from '@/src/assemblee/components/GroupArcPath';
import type { CompositionScene } from '@/src/assemblee/models/composition';
import { paint } from '@/src/core/web/svg-paint';

/** Taille des abréviations de groupe, en pixels réels (le schéma est mis à l'échelle). */
const LABEL_PX = 12;
const NARROW_BELOW = siteLayout.breakpoint.md;

/**
 * Hémicycle de la composition actuelle : mêmes arcs et mêmes abréviations que l'hémicycle d'un
 * vote, les sièges remplis de la couleur officielle de leur groupe (contour fin pour les couleurs
 * claires), tous les groupes traités de la même façon. Une image
 * pour les technologies d'assistance ; la liste sous le schéma en est l'alternative complète.
 */
export function CompositionChart({ scene, label }: { scene: CompositionScene; label: string }) {
  const { colors, fonts } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const compact = screenWidth < NARROW_BELOW;
  const box = compact ? scene.compactBox : scene.box;
  // Estimation de départ proche de la largeur réelle (colonne de lecture, gouttières de 16 px) :
  // si la mesure n'arrive pas après l'hydratation, les étiquettes gardent une taille juste.
  const [width, setWidth] = useState(() => Math.max(280, Math.min(screenWidth - 32, 768)));
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
              strokeWidth={0.006}
              {...paint({ fill: seat.color, stroke: colors.surface.border.tertiary })}
            />
          ))}
        </G>
        {scene.arcs.map((arc) => (
          <G key={arc.groupe}>
            <GroupArcPath arc={arc} />
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
