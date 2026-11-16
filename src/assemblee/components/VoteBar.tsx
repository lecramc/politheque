import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import type { BarSegment } from '@/src/assemblee/models/group-table';
import { barLayout } from '@/src/assemblee/models/vote-bar';
import { paint } from '@/src/core/web/svg-paint';

/** Même motif dans toutes les barres (identifiant fixe : identique dans le HTML statique et au rendu client). */
const STRIPES_ID = 'vote-bar-stripes';
const HEIGHT = 18;
const STROKE = 2;

/**
 * Barre empilée des positions : mêmes formes que les sièges (plein = pour, hachuré = contre,
 * contour = abstention, pointillé = n'a pas voté). Décorative : la phrase à côté dit les mêmes
 * chiffres. `threshold` pose un trait à la majorité requise.
 */
export function VoteBar({
  segments,
  total,
  threshold,
}: {
  segments: BarSegment[];
  total?: number;
  threshold?: number;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(320);
  const stripes = STRIPES_ID;
  const { rects, mark } = barLayout(segments, total, width, threshold);
  const { vote } = colors;
  const onLayout = (e: LayoutChangeEvent) => {
    const measured = e.nativeEvent.layout.width;
    if (measured > 0) setWidth(measured);
  };

  return (
    <View
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={{ width: '100%', height: HEIGHT + 8, justifyContent: 'center' }}
    >
      <Svg width="100%" height={HEIGHT + 8} viewBox={`0 0 ${width} ${HEIGHT + 8}`}>
        <Defs>
          <Pattern
            id={stripes}
            patternUnits="userSpaceOnUse"
            width={7}
            height={7}
            patternTransform="rotate(45)"
          >
            <Rect x={0} y={0} width={7} height={7} {...paint({ fill: vote.contre })} />
            <Rect x={0} y={0} width={3} height={7} {...paint({ fill: vote.contreMark })} />
          </Pattern>
        </Defs>
        {rects.map((rect) => {
          const x = rect.x + STROKE / 2;
          const w = Math.max(rect.width - STROKE, 1);
          const y = 4 + STROKE / 2;
          const h = HEIGHT - STROKE;
          const key = rect.kind + rect.x;
          if (rect.kind === 'pour') {
            return (
              <Rect
                key={key}
                x={rect.x}
                y={4}
                width={rect.width}
                height={HEIGHT}
                {...paint({ fill: vote.pour })}
              />
            );
          }
          if (rect.kind === 'contre') {
            return (
              <Rect
                key={key}
                x={x}
                y={y}
                width={w}
                height={h}
                strokeWidth={STROKE}
                fill={`url(#${stripes})`}
                {...paint({ stroke: vote.contreMark })}
              />
            );
          }
          return (
            <Rect
              key={key}
              x={x}
              y={y}
              width={w}
              height={h}
              strokeWidth={STROKE}
              strokeDasharray={rect.kind === 'aucun' ? '4 3' : undefined}
              {...paint({
                fill: 'none',
                stroke: rect.kind === 'abstention' ? vote.abstention : vote.aucun,
              })}
            />
          );
        })}
        {mark !== null ? (
          <>
            {/* Un liseré de la couleur du fond : le trait reste lisible sur un segment plein. */}
            <Line
              x1={mark}
              x2={mark}
              y1={0}
              y2={HEIGHT + 8}
              strokeWidth={6}
              {...paint({ stroke: colors.background.default })}
            />
            <Line
              x1={mark}
              x2={mark}
              y1={0}
              y2={HEIGHT + 8}
              strokeWidth={2.5}
              {...paint({ stroke: colors.text.primary })}
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}
