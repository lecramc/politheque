import React, { type ComponentProps, useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, easing, journeySequence, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { APP_NAME } from '@/src/core/config/app';

/**
 * Symbole « demi-cocarde » : trois demi-disques concentriques (bleu au centre, blanc, rouge).
 * Chaque couleur couvre tout le demi-cercle : aucune n'est « à gauche » ou « à droite ».
 */
export function LogoMark({
  width = 38,
  muted = false,
  animateIn = false,
}: {
  width?: number;
  /** Atténué (opacité 0,45) : l'arrivée du parcours avant que les six tampons soient obtenus. */
  muted?: boolean;
  /**
   * Arrivée du parcours : les trois demi-disques (de l'extérieur vers l'intérieur : rouge,
   * blanc, bleu) apparaissent l'un après l'autre (opacité 0 → 1, échelle 0,9 → 1,
   * `duration.arrival`, décalage 120 ms). Une seule fois ; mouvement réduit : logo plein.
   */
  animateIn?: boolean;
}) {
  const { colors } = useTheme();
  const { reduce } = useMotion();
  const playing = animateIn && !reduce;
  const outer = useSharedValue(playing ? 0 : 1);
  const middle = useSharedValue(playing ? 0 : 1);
  const inner = useSharedValue(playing ? 0 : 1);
  const values = [outer, middle, inner];
  useLayoutEffect(() => {
    if (!playing) return;
    values.forEach((value, i) => {
      value.value = 0;
      value.value = withDelay(
        journeySequence.arrivalAt + i * journeySequence.arrivalStagger,
        withTiming(1, { duration: duration.arrival, easing: easing.out })
      );
    });
  }, [playing]);
  const styleOf = (value: typeof outer) => ({
    opacity: value.value,
    // Échelle depuis le bas-centre : le demi-disque « pousse » depuis la base du logo.
    transform: [{ scale: interpolate(value.value, [0, 1], [0.9, 1]) }],
  });
  const outerStyle = useAnimatedStyle(() => styleOf(outer));
  const middleStyle = useAnimatedStyle(() => styleOf(middle));
  const innerStyle = useAnimatedStyle(() => styleOf(inner));
  const half = (
    size: number,
    color: string,
    animated: ComponentProps<typeof Animated.View>['style'],
    outlined = false
  ) => (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: (width - size) / 2,
          width: size,
          height: size / 2,
          borderTopLeftRadius: size / 2,
          borderTopRightRadius: size / 2,
          backgroundColor: color,
          borderWidth: outlined ? 0.7 : 0,
          borderBottomWidth: 0,
          borderColor: colors.tricolore.contourBlanc,
          transformOrigin: 'bottom',
        },
        playing ? animated : null,
      ]}
    />
  );
  return (
    <View
      style={{ width, height: width / 2, opacity: muted ? 0.45 : 1 }}
      accessibilityElementsHidden
    >
      {half(width, colors.tricolore.rouge, outerStyle)}
      {half(width * 0.69, colors.tricolore.blanc, middleStyle, true)}
      {half(width * 0.37, colors.tricolore.bleu, innerStyle)}
    </View>
  );
}

export function Logo() {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}
      accessibilityLabel={APP_NAME}
    >
      <LogoMark />
      <Text
        style={{ ...fonts.displayBold, fontSize: 21, lineHeight: 24, color: colors.text.strong }}
      >
        {APP_NAME}
      </Text>
    </View>
  );
}

/** Filet tricolore sous la barre : seul autre usage autorisé des couleurs tricolores. */
export function Tricolore({ height = 4 }: { height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', height }} accessibilityElementsHidden>
      <View style={{ flex: 1, backgroundColor: colors.tricolore.bleu }} />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.tricolore.blanc,
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: colors.surface.border.primary,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.tricolore.rouge }} />
    </View>
  );
}
