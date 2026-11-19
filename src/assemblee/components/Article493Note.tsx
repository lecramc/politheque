import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { ExternalLink } from '@/src/programmes/components/ExternalLink';

export type Article493 = { text: string; sourceLabel: string; sourceUrl: string };

/** Rappel sourcé : un texte adopté par l'article 49, alinéa 3, n'est pas voté. */
export function Article493Note({ note }: { note: Article493 }) {
  const { colors, effects } = useTheme();
  return (
    <View
      role="note"
      style={{
        gap: effects.spacing.xs,
        padding: effects.spacing.md,
        borderRadius: effects.borderRadius.small,
        backgroundColor: colors.tintSoft,
      }}
    >
      <Text style={{ fontSize: 16, lineHeight: 24 }}>{note.text}</Text>
      <ExternalLink href={note.sourceUrl} standalone>
        {note.sourceLabel}
      </ExternalLink>
    </View>
  );
}
