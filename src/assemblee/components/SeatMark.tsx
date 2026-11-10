import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import type { SeatGlyph } from '@/src/assemblee/models/seat-view';
import { paint } from '@/src/core/web/svg-paint';

type VoteColors = ReturnType<typeof useTheme>['colors']['vote'];

/**
 * Un siège, à l'intérieur d'un `<Svg>` : la forme porte la position autant que la teinte.
 * disque plein = pour · disque clair barré = contre · anneau = abstention · point = non-votant ·
 * contour pointillé = pas de vote enregistré · rien = siège vacant.
 * Un trait sous le siège signale un vote exprimé par délégation.
 */
export function SeatMark({
  cx,
  cy,
  r,
  glyph,
  delegation = false,
  vote,
}: {
  cx: number;
  cy: number;
  r: number;
  glyph: SeatGlyph;
  delegation?: boolean;
  vote: VoteColors;
}) {
  if (glyph === 'none') return null;
  const markColor =
    glyph === 'disc'
      ? vote.pour
      : glyph === 'disc-slash'
        ? vote.contreMark
        : glyph === 'ring' || glyph === 'dot'
          ? vote.abstention
          : vote.aucun;
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
      {glyph === 'ring' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={r * 0.8}
          strokeWidth={r * 0.4}
          {...paint({ fill: 'none', stroke: vote.abstention })}
        />
      ) : null}
      {glyph === 'dot' ? (
        <Circle cx={cx} cy={cy} r={r * 0.4} {...paint({ fill: vote.nonVotant })} />
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
      {delegation ? (
        <Line
          x1={cx - r * 0.9}
          y1={cy + r * 1.3}
          x2={cx + r * 0.9}
          y2={cy + r * 1.3}
          strokeWidth={r * 0.3}
          {...paint({ stroke: markColor })}
        />
      ) : null}
    </>
  );
}

/** Même forme, à taille de texte : légende, tableau des députés. Décoratif (le texte dit la position). */
export function VoteGlyph({
  glyph,
  delegation = false,
  size = 16,
}: {
  glyph: SeatGlyph;
  delegation?: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <Svg width={size} height={size} viewBox="-1.3 -1.3 2.6 2.8">
        <SeatMark cx={0} cy={0} r={1} glyph={glyph} delegation={delegation} vote={colors.vote} />
      </Svg>
    </View>
  );
}
