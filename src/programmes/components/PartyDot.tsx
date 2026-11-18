import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { registerStyle } from '@/components/webTheme';
import { useMarkOutline } from '@/src/core/hooks/useMarkOutline';
import { initialTextColor } from '@/src/programmes/models/party-dot-colors';

/**
 * Pastille de parti : un disque plein de la couleur d'identification, l'initiale écrite dessus en
 * blanc ou quasi-noir selon le meilleur contraste. Un contour fin garde visibles les couleurs
 * claires sur fond crème et les sombres sur fond nuit. Sous 20 px : disque plein sans initiale.
 * La couleur n'est jamais la seule information : le nom du parti est toujours écrit à côté.
 */
export function PartyDot({
  color,
  size = 12,
  label,
}: {
  color: string;
  size?: number;
  label?: string;
}) {
  const outline = useMarkOutline(color);
  return (
    <View
      style={[
        styles.disc,
        registerStyle({
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderColor: outline,
        }),
      ]}
    >
      {label && size >= 20 ? (
        <Text
          style={[
            styles.initial,
            registerStyle({ fontSize: size * 0.38, color: initialTextColor(color) }),
          ]}
        >
          {label.slice(0, 1)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  disc: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  initial: { ...theme.fonts.bold },
});
