import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';

/** Encadré sobre, identique pour les dix partis. Le texte vient du modèle (un seul drapeau). */
export function ProceduresNotice({ text }: { text: string }) {
  const { colors, effects } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={{
        gap: effects.spacing.xs,
        padding: effects.spacing.md,
        borderWidth: 1,
        borderRadius: effects.borderRadius.xs,
        borderColor: colors.surface.border.primary,
        backgroundColor: colors.surface.secondary,
      }}
    >
      <Text style={{ fontSize: 15, lineHeight: 23 }}>{text}</Text>
      <TextLink href="/methodologie" size={14} standalone>
        Notre méthode
      </TextLink>
    </View>
  );
}
