import React, { useLayoutEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { duration, easing as easingCurves, journeySequence, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';

const STROKE = 3;
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Longueur approchée d'une courbe de Bézier cubique verticale (échantillonnage). */
function curveLength(x1: number, x2: number, height: number) {
  const mid = height / 2;
  const pts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
    const t = i / 10;
    const u = 1 - t;
    const x = u ** 3 * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x2;
    const y = 3 * u * t * t * mid + 3 * u * u * t * mid + t ** 3 * height;
    return [x, y];
  });
  let length = 0;
  for (let i = 1; i < pts.length; i++) {
    length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return Math.ceil(length) + 1;
}

/**
 * Tronçon du chemin entre deux étapes : pointillé (à parcourir) ou trait plein (étape
 * terminée). `from` et `to` sont les abscisses du centre des deux marqueurs.
 */
export function JourneySegment({
  done,
  from,
  to,
  height,
  animateIn = false,
}: {
  done: boolean;
  from: number;
  to: number;
  height: number;
  /**
   * L'étape vient d'être terminée pendant cette session : le trait plein se trace
   * (`duration.trace`) une fois l'arc rempli, en remplaçant le pointillé. Jamais à l'hydratation.
   * Mouvement réduit : trait plein immédiat. Aucune boucle.
   */
  animateIn?: boolean;
}) {
  const { colors } = useTheme();
  const { reduce } = useMotion();
  const minX = Math.min(from, to);
  const width = Math.abs(to - from) + STROKE * 2;
  const x1 = from - minX + STROKE;
  const x2 = to - minX + STROKE;
  const mid = height / 2;
  const d = `M ${x1} 0 C ${x1} ${mid} ${x2} ${mid} ${x2} ${height}`;
  const length = curveLength(x1, x2, height);

  const playing = animateIn && done && !reduce;
  const progress = useSharedValue(playing ? 0 : 1);

  useLayoutEffect(() => {
    if (!playing) return;
    progress.value = 0;
    progress.value = withDelay(
      journeySequence.traceAt,
      withTiming(1, { duration: duration.trace, easing: easingCurves.out })
    );
  }, [playing]);

  const solidProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
    strokeOpacity: progress.value > 0.001 ? 1 : 0,
  }));
  // Le pointillé cède la place au trait plein dès que le tracé commence.
  const dashedProps = useAnimatedProps(() => ({
    strokeOpacity: progress.value > 0.001 ? 0 : 1,
  }));

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', left: minX - STROKE, top: 0 }}
      pointerEvents="none"
    >
      {!done || playing ? (
        <AnimatedPath
          d={d}
          stroke={colors.tintBorder}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`1 ${STROKE * 2.6}`}
          fill="none"
          animatedProps={playing ? dashedProps : undefined}
        />
      ) : null}
      {done ? (
        <AnimatedPath
          d={d}
          stroke={colors.tint}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={length}
          fill="none"
          animatedProps={playing ? solidProps : undefined}
        />
      ) : null}
    </Svg>
  );
}
