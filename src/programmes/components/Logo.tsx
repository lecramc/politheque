import React, { useId, useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, G, Mask, Path, Rect } from 'react-native-svg';

import { duration, easing, journeySequence, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { APP_NAME } from '@/src/core/config/app';
import { paint } from '@/src/core/web/svg-paint';

/*
 * Monogramme « P » (docs/marque/svg/politheque-c-monogramme/) : le P de Fraunces 600, dont la
 * panse est découpée en trois bandes (rouge à l'extérieur, blanc, bleu à l'intérieur) et que la
 * haste à empattements recouvre, détachée par une réserve. Chaque couleur suit toute la panse :
 * aucune n'est « à gauche » ou « à droite ». Coordonnées en unités de la police (capitale = 1400).
 */
const STEM =
  'M563 99L563 1233Q563 1255 575 1270Q587 1286 613 1290L700 1302Q725 1307 736 1319Q747 1331 747 1354Q747 1375 732 1388Q718 1400 687 1400L165 1400Q134 1400 119 1388Q104 1375 104 1354Q104 1316 146 1303L204 1290Q228 1283 240 1269Q253 1255 253 1233L253 167Q253 145 240 131Q228 117 204 110L146 97Q104 84 104 46Q104 24 119 12Q134 0 165 0L563 0L563 99Z';
/** Dessin courant, et taille optique pour les petites tailles (panse plus épaisse, réserve plus large). */
const BANDS = {
  regular: {
    reserve: 48,
    red: 'M420 0 L700 0 A638 467 0 0 1 700 934 L420 934 L420 899 L700 899 A532 432 0 0 0 700 35 L420 35 Z',
    white:
      'M420 35 L700 35 A532 432 0 0 1 700 899 L420 899 L420 868 L700 868 A440 401 0 0 0 700 66 L420 66 Z',
    blue: 'M420 66 L700 66 A440 401 0 0 1 700 868 L420 868 L420 833 L700 833 A334 366 0 0 0 700 101 L420 101 Z',
  },
  small: {
    reserve: 80,
    red: 'M420 -13 L700 -13 A660 480 0 0 1 700 947 L420 947 L420 871 L700 871 A530 404 0 0 0 700 63 L420 63 Z',
    white:
      'M420 63 L700 63 A530 404 0 0 1 700 871 L420 871 L420 808 L700 808 A422 341 0 0 0 700 126 L420 126 Z',
    blue: 'M420 126 L700 126 A422 341 0 0 1 700 808 L420 808 L420 737 L700 737 A300 270 0 0 0 700 197 L420 197 Z',
  },
};
/** Boîte du symbole (unités de la police) : de l'empattement gauche au bord de la panse. */
const VIEW = { x: 96, y: -16, width: 1250, height: 1420 };
/** Hauteur de capitale de Fraunces : 1400 unités pour 2000 par cadratin. */
const CAP_RATIO = 0.7;
/** Distance de la ligne de base au bas de la boîte de ligne, pour Fraunces (ascendante 0,978, descendante 0,255). */
const baselineFromBottom = (fontSize: number, lineHeight: number) =>
  (lineHeight - 1.233 * fontSize) / 2 + 0.255 * fontSize;

export function LogoMark({
  height = 18,
  muted = false,
  animateIn = false,
}: {
  /** Hauteur de la capitale, en points : le symbole occupe la place d'un P de cette taille. */
  height?: number;
  /** Atténué (opacité 0,45) : l'arrivée du parcours avant que les six tampons soient obtenus. */
  muted?: boolean;
  /**
   * Arrivée du parcours : le monogramme apparaît (opacité 0 → 1, échelle 0,9 → 1 depuis la base,
   * `duration.arrival`). Une seule fois ; mouvement réduit : logo plein.
   */
  animateIn?: boolean;
}) {
  const { colors } = useTheme();
  const { reduce } = useMotion();
  const maskId = `p-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const playing = animateIn && !reduce;
  const progress = useSharedValue(playing ? 0 : 1);
  useLayoutEffect(() => {
    if (!playing) return;
    progress.value = 0;
    progress.value = withDelay(
      journeySequence.arrivalAt,
      withTiming(1, { duration: duration.arrival, easing: easing.out })
    );
  }, [playing]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.9, 1]) }],
  }));
  const scale = height / 1400;
  const bands = height < 28 ? BANDS.small : BANDS.regular;
  return (
    <Animated.View
      style={[
        {
          width: VIEW.width * scale,
          height: VIEW.height * scale,
          opacity: muted ? 0.45 : 1,
          transformOrigin: 'bottom',
        },
        playing ? animatedStyle : null,
      ]}
      accessibilityElementsHidden
    >
      <Svg
        width={VIEW.width * scale}
        height={VIEW.height * scale}
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      >
        <Defs>
          <Mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="-100" width="1500" height="1600">
            <Rect x="0" y="-100" width="1500" height="1600" fill="#fff" />
            <Path
              d={STEM}
              fill="#000"
              stroke="#000"
              strokeWidth={bands.reserve}
              strokeLinejoin="round"
            />
          </Mask>
        </Defs>
        <G mask={`url(#${maskId})`}>
          <Path d={bands.red} {...paint({ fill: colors.tricolore.rouge })} />
          <Path d={bands.white} {...paint({ fill: colors.tricolore.blanc })} />
          <Path d={bands.blue} {...paint({ fill: colors.tricolore.bleu })} />
        </G>
        <Path d={STEM} {...paint({ fill: colors.text.strong })} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Logotype « fusion » : le monogramme prend la place du P de « Polithèque », suivi de
 * « olithèque » en Fraunces 600. Le nom complet est donné aux lecteurs d'écran.
 */
export function Logo() {
  const { colors, fonts } = useTheme();
  const fontSize = 22;
  const lineHeight = 26;
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end' }}
      accessible
      accessibilityLabel={APP_NAME}
    >
      <View style={{ marginBottom: baselineFromBottom(fontSize, lineHeight), marginRight: 1 }}>
        <LogoMark height={fontSize * CAP_RATIO} />
      </View>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ ...fonts.display, fontSize, lineHeight, color: colors.text.strong }}
      >
        {APP_NAME.slice(1)}
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
