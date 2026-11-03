import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/components/ThemeContext';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, effects } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface.primary,
          borderColor: colors.surface.border.primary,
          borderWidth: 1,
          borderRadius: effects.borderRadius.small,
          padding: effects.spacing.md,
          gap: effects.spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
