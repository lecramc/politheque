import React, { useEffect, useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, easing, journeySequence, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { JourneyNode, ROW_HEIGHT } from '@/src/programmes/components/JourneyNode';
import { JourneySegment } from '@/src/programmes/components/JourneySegment';
import { MARKER_HEIGHT, MARKER_WIDTH } from '@/src/programmes/components/NodeMarker';
import type { JourneyStepId } from '@/src/programmes/models/journey.model';
import type { JourneyNodeModel } from '@/src/programmes/view-models/journey.view-model';

const ZIGZAG = [0, 24, 48, 24];
const offsetOf = (index: number) => ZIGZAG[(index - 1) % ZIGZAG.length];
const CENTER = MARKER_WIDTH / 2;

/**
 * Liste ordonnée des étapes reliées par des tronçons. Mobile : zigzag de hauteur fixe.
 * Desktop : colonne de cartes.
 */
export function JourneyPath({
  nodes,
  variant,
  celebrate,
  onCelebrated,
  arriving = false,
}: {
  nodes: JourneyNodeModel[];
  variant: 'compact' | 'cards';
  /** Tampons à « poser » : ne contient que des étapes terminées pendant cette session. */
  celebrate: JourneyStepId[];
  onCelebrated: (ids: JourneyStepId[]) => void;
  /** Dernier tampon obtenu : l'arrivée (logo) s'anime aussi ; la séquence dure donc plus. */
  arriving?: boolean;
}) {
  const { effects, colors } = useTheme();
  const { reduce } = useMotion();

  // La séquence (arc, tracé, tampon, nœud suivant) se joue d'elle-même sur le thread UI ;
  // `onCelebrated` n'est appelé qu'à sa fin : une seule lecture, même si l'écran perd le
  // focus entre-temps (la file est alors rejouée au retour).
  useEffect(() => {
    if (celebrate.length === 0) return;
    const end = reduce
      ? duration.stampFade
      : arriving
        ? journeySequence.arrivalEnd
        : journeySequence.end;
    const timer = setTimeout(() => onCelebrated(celebrate), end);
    return () => clearTimeout(timer);
  }, [celebrate, onCelebrated, reduce, arriving]);

  const celebrating = (id: JourneyStepId) => celebrate.includes(id);

  if (variant === 'cards') {
    const gap = effects.spacing.md;
    return (
      <View role="list" style={{ gap }}>
        {nodes.map((node, i) => (
          <View key={node.id} role="listitem">
            {i < nodes.length - 1 ? (
              <CardSegment
                done={node.segmentDone}
                animateIn={celebrating(node.id)}
                top={MARKER_HEIGHT}
                bottom={-gap}
                solid={colors.tint}
                dotted={colors.tintBorder}
              />
            ) : null}
            <JourneyNode
              node={node}
              variant="cards"
              celebrate={celebrating(node.id)}
              lightUp={i > 0 && celebrating(nodes[i - 1].id)}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View role="list">
      {nodes.map((node, i) => {
        const last = i === nodes.length - 1;
        return (
          <View key={node.id} role="listitem" style={{ height: ROW_HEIGHT }}>
            {last ? null : (
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: MARKER_HEIGHT, left: 0, right: 0 }}
              >
                <JourneySegment
                  done={node.segmentDone}
                  from={offsetOf(node.index) + CENTER}
                  to={offsetOf(node.index + 1) + CENTER}
                  height={ROW_HEIGHT - MARKER_HEIGHT}
                  animateIn={celebrating(node.id)}
                />
              </View>
            )}
            <JourneyNode
              node={node}
              variant="compact"
              offset={offsetOf(node.index)}
              celebrate={celebrating(node.id)}
              lightUp={i > 0 && celebrating(nodes[i - 1].id)}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * Tronçon vertical de la version desktop : même logique que `JourneySegment`
 * (le trait plein se déroule du haut vers le bas, `duration.trace`, après l'arc).
 */
function CardSegment({
  done,
  animateIn,
  top,
  bottom,
  solid,
  dotted,
}: {
  done: boolean;
  animateIn: boolean;
  top: number;
  bottom: number;
  solid: string;
  dotted: string;
}) {
  const { reduce } = useMotion();
  const playing = animateIn && done && !reduce;
  const progress = useSharedValue(playing ? 0 : 1);
  useLayoutEffect(() => {
    if (!playing) return;
    progress.value = 0;
    progress.value = withDelay(
      journeySequence.traceAt,
      withTiming(1, { duration: duration.trace, easing: easing.out })
    );
  }, [playing]);
  const solidStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0.001 ? 1 : 0,
    transform: [{ scaleY: Math.max(progress.value, 0.001) }],
  }));
  const dottedStyle = useAnimatedStyle(() => ({ opacity: progress.value > 0.001 ? 0 : 1 }));
  const base = { position: 'absolute' as const, left: CENTER - 1, top, bottom, borderLeftWidth: 3 };
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {!done || playing ? (
        <Animated.View
          style={[
            base,
            { borderStyle: 'dotted', borderColor: dotted },
            playing ? dottedStyle : null,
          ]}
        />
      ) : null}
      {done ? (
        <Animated.View
          style={[
            base,
            { borderStyle: 'solid', borderColor: solid, transformOrigin: 'top' },
            playing ? solidStyle : null,
          ]}
        />
      ) : null}
    </View>
  );
}
