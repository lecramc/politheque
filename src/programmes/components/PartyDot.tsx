import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';

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
  const { colors, fonts } = useTheme();
  const ring = Math.max(2, Math.round(size / 9));
  return (
    <View
      style={{
        padding: 1,
        borderRadius: size,
        borderWidth: 1,
        borderColor: colors.surface.border.tertiary,
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring,
          borderColor: color,
          backgroundColor: colors.surface.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && size >= 20 ? (
          <Text style={{ ...fonts.bold, fontSize: size * 0.38, color: colors.text.primary }}>
            {label.slice(0, 1)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
