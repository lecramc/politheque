import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';

/**
 * Pastille de la couleur officielle d'un groupe à l'Assemblée. Décorative : le sigle est toujours
 * écrit à côté, la couleur n'est jamais la seule information. Le contour fin garde visibles les
 * couleurs claires (HOR, SOC, LIOT) sur fond crème et les foncées (RN) sur fond sombre.
 */
export function GroupSwatch({ color, size = 14 }: { color: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: colors.surface.border.tertiary,
      }}
    />
  );
}
