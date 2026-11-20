import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import type { SeatGlyph } from '@/src/assemblee/models/seat-view';
import { paint } from '@/src/core/web/svg-paint';

type VoteColors = ReturnType<typeof useTheme>['colors']['vote'];

/**
 * Une marque de la grammaire pour / contre (`stance-scale.ts`), à l'intérieur d'un `<Svg>` : la
 * forme porte la position autant que la teinte. disque plein = pour · disque barré = contre ·
 * mêmes formes en contour = plutôt pour / plutôt contre · contour et « = » = mitigé · anneau
 * épais = abstention · demi-disque = partagé · contour pointillé = n'a pas voté (ou ne prend pas
 * part au vote, ou pas de position claire) · rien = siège vacant.
 */
export function SeatMark({
  cx,
  cy,
  r,
  glyph,
  vote,
}: {
  cx: number;
  cy: number;
  r: number;
  glyph: SeatGlyph;
  vote: VoteColors;
}) {
  if (glyph === 'none') return null;
  return (
    <>
      {glyph === 'disc' ? <Circle cx={cx} cy={cy} r={r} {...paint({ fill: vote.pour })} /> : null}
      {glyph === 'disc-slash' ? (
        <>
          <Circle
            cx={cx}
            cy={cy}
            r={r * 0.88}
            strokeWidth={r * 0.3}
            {...paint({ fill: vote.contre, stroke: vote.contreMark })}
          />
          <Line
            x1={cx - r * 0.62}
            y1={cy + r * 0.62}
            x2={cx + r * 0.62}
            y2={cy - r * 0.62}
            strokeWidth={r * 0.34}
            {...paint({ stroke: vote.contreMark })}
          />
        </>
      ) : null}
      {glyph === 'disc-outline' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={r * 0.84}
          strokeWidth={r * 0.24}
          {...paint({ fill: 'none', stroke: vote.pour })}
        />
      ) : null}
      {glyph === 'outline-slash' ? (
        <>
          <Circle
            cx={cx}
            cy={cy}
            r={r * 0.84}
            strokeWidth={r * 0.24}
            {...paint({ fill: 'none', stroke: vote.contreMark })}
          />
          <Line
            x1={cx - r * 0.56}
            y1={cy + r * 0.56}
            x2={cx + r * 0.56}
            y2={cy - r * 0.56}
            strokeWidth={r * 0.26}
            {...paint({ stroke: vote.contreMark })}
          />
        </>
      ) : null}
      {glyph === 'outline-equal' ? (
        <>
          <Circle
            cx={cx}
            cy={cy}
            r={r * 0.84}
            strokeWidth={r * 0.24}
            {...paint({ fill: 'none', stroke: vote.abstention })}
          />
          <Line
            x1={cx - r * 0.4}
            y1={cy - r * 0.2}
            x2={cx + r * 0.4}
            y2={cy - r * 0.2}
            strokeWidth={r * 0.18}
            {...paint({ stroke: vote.abstention })}
          />
          <Line
            x1={cx - r * 0.4}
            y1={cy + r * 0.2}
            x2={cx + r * 0.4}
            y2={cy + r * 0.2}
            strokeWidth={r * 0.18}
            {...paint({ stroke: vote.abstention })}
          />
        </>
      ) : null}
      {glyph === 'half' ? (
        <>
          <Path
            d={`M ${cx} ${cy - r * 0.84} A ${r * 0.84} ${r * 0.84} 0 0 0 ${cx} ${cy + r * 0.84} Z`}
            {...paint({ fill: vote.abstention })}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r * 0.84}
            strokeWidth={r * 0.24}
            {...paint({ fill: 'none', stroke: vote.abstention })}
          />
        </>
      ) : null}
      {glyph === 'ring' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={r * 0.8}
          strokeWidth={r * 0.4}
          {...paint({ fill: 'none', stroke: vote.abstention })}
        />
      ) : null}
      {glyph === 'dashed' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={r * 0.85}
          strokeWidth={r * 0.25}
          strokeDasharray={`${r * 0.5} ${r * 0.5}`}
          {...paint({ fill: 'none', stroke: vote.aucun })}
        />
      ) : null}
    </>
  );
}

/** Même forme, à taille de texte : légende, rangées de députés. Décoratif (le texte dit la position). */
export function VoteGlyph({ glyph, size = 16 }: { glyph: SeatGlyph; size?: number }) {
  const { colors } = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <Svg width={size} height={size} viewBox="-1.3 -1.3 2.6 2.6">
        <SeatMark cx={0} cy={0} r={1} glyph={glyph} vote={colors.vote} />
      </Svg>
    </View>
  );
}
