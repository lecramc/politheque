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
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: effects.borderRadius.round,
        backgroundColor: colors.tintSoft,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.tint }}>{label}</Text>
    </View>
  );
}
