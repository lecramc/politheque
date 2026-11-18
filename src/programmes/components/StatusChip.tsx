import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';

/** Étiquette courte et uniforme (statut de candidature, échéance…). */
export function StatusChip({ label }: { label: string }) {
  const { colors, effects } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        maxWidth: '100%',
        paddingHorizontal: effects.spacing.xs,
        paddingVertical: effects.spacing.xxs,
        borderRadius: effects.borderRadius.round,
        backgroundColor: colors.tintSoft,
      }}
    >
      <Text numberOfLines={1} style={{ fontSize: 13, color: colors.tint }}>
        {label}
      </Text>
    </View>
  );
}
