import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { APP_NAME } from '@/src/core/config/app';

/**
 * Symbole « demi-cocarde » : trois demi-disques concentriques (bleu au centre, blanc, rouge).
 * Chaque couleur couvre tout le demi-cercle : aucune n'est « à gauche » ou « à droite ».
 */
export function LogoMark({ width = 38 }: { width?: number }) {
  const { colors } = useTheme();
  const half = (size: number, color: string, outlined = false) => (
    <View
      style={{
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
      }}
    />
  );
  return (
    <View style={{ width, height: width / 2 }} accessibilityElementsHidden>
      {half(width, colors.tricolore.rouge)}
      {half(width * 0.69, colors.tricolore.blanc, true)}
      {half(width * 0.37, colors.tricolore.bleu)}
    </View>
  );
}

export function Logo() {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}
      accessibilityRole="header"
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
