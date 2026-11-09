import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { registerStyle, useColorStyle } from '@/components/webTheme';

/**
 * Pastille de parti : un anneau de la couleur d'identification autour de l'initiale.
 * Jamais d'aplat, pour ne pas se confondre avec les couleurs d'interface.
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
  const c = useColorStyle();
  const ring = Math.max(2, Math.round(size / 9));
  return (
    <View
      style={[
        styles.outer,
        registerStyle({ borderRadius: size }),
        c((p) => ({ borderColor: p.surface.border.tertiary })),
      ]}
    >
      <View
        style={[
          styles.inner,
          registerStyle({
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ring,
            borderColor: color,
          }),
          c((p) => ({ backgroundColor: p.surface.primary })),
        ]}
      >
        {label && size >= 20 ? (
          <Text
            style={[
              styles.initial,
              registerStyle({ fontSize: size * 0.38 }),
              c((p) => ({ color: p.text.primary })),
            ]}
          >
            {label.slice(0, 1)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { padding: 1, borderWidth: 1 },
  inner: { alignItems: 'center', justifyContent: 'center' },
  initial: { ...theme.fonts.bold },
});
