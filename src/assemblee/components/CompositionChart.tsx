import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import { GroupArcPath } from '@/src/assemblee/components/GroupArcPath';
import { useCompactChart } from '@/src/assemblee/components/useCompactChart';
import type { CompositionScene } from '@/src/assemblee/models/composition';
import { useMarkOutline } from '@/src/core/hooks/useMarkOutline';
import { paint } from '@/src/core/web/svg-paint';

/** Taille des abréviations de groupe, en pixels réels (le schéma est mis à l'échelle). */
const LABEL_PX = 12;
/** Contour d'un siège, en pixels réels : assez épais pour les couleurs pâles ou sombres. */
const OUTLINE_PX = 1.5;

/** Siège plein de la couleur du groupe, cerné selon `useMarkOutline` (plus marqué si la couleur se confond avec le fond). */
function FilledSeat({
  cx,
  cy,
  r,
  color,
  strokeWidth,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  strokeWidth: number;
}) {
  const outline = useMarkOutline(color);
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      strokeWidth={strokeWidth}
      {...paint({ fill: color, stroke: outline })}
    />
  );
}

/**
 * Hémicycle de la composition actuelle : mêmes arcs et mêmes abréviations que l'hémicycle d'un
 * vote, les sièges remplis de la couleur officielle de leur groupe (contour fin pour les couleurs
 * claires), tous les groupes traités de la même façon. Une image
 * pour les technologies d'assistance ; la liste sous le schéma en est l'alternative complète.
 */
export function CompositionChart({ scene, label }: { scene: CompositionScene; label: string }) {
  const { colors, fonts } = useTheme();
  const { compact, estimatedWidth } = useCompactChart();
  const box = compact ? scene.compactBox : scene.box;
  // Tant que la mesure n'est pas arrivée : largeur estimée, les étiquettes gardent une taille juste.
  const [measured, setMeasured] = useState<number | null>(null);
  const width = measured ?? estimatedWidth;
  const onLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.width > 0) setMeasured(e.nativeEvent.layout.width);
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
            <FilledSeat
              key={seat.place}
              cx={seat.x}
              cy={seat.y}
              r={scene.layout.seatRadius * 0.9}
              color={seat.color}
              strokeWidth={OUTLINE_PX * (box.width / width)}
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
