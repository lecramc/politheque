import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';

/** Encart à liseré gauche : invitation à lire, texte fixe (jamais lié aux réponses). */
export function StepInvite({ text }: { text: string }) {
  const { colors, effects } = useTheme();
  return (
    <View
      style={{
        padding: effects.spacing.md,
        borderRadius: effects.borderRadius.small,
        borderLeftWidth: 4,
        borderLeftColor: colors.tint,
        backgroundColor: colors.tintSoft,
      }}
    >
      <Text>{text}</Text>
    </View>
  );
}
