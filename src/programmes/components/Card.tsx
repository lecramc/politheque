import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { useColorStyle } from '@/components/webTheme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColorStyle();
  return (
    <View
      style={[
        styles.card,
        c((p) => ({ backgroundColor: p.surface.primary, borderColor: p.surface.border.primary })),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: theme.effects.borderRadius.small,
    padding: theme.effects.spacing.md,
    gap: theme.effects.spacing.sm,
  },
});
