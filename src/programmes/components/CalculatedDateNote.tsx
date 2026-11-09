import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { CalculatedNote } from '@/src/programmes/models/contenus-2027';

/** Une date déduite d'une règle : signalée comme telle, avec la règle et sa source. */
export function CalculatedDateNote({ note }: { note: CalculatedNote }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View
      style={{
        gap: effects.spacing.xxs,
        padding: effects.spacing.sm,
        borderRadius: effects.borderRadius.xs,
        borderWidth: 1,
        borderColor: colors.tintBorder,
        backgroundColor: colors.tintSoft,
      }}
    >
      <Text style={{ ...fonts.bold, fontSize: 14, color: colors.tint }}>Date calculée</Text>
      <Text style={{ fontSize: 16, lineHeight: 24 }}>
        {`${note.label} : `}
        <Text style={{ ...fonts.bold, fontSize: 16 }}>{note.text}</Text>
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {`Règle : ${note.rule}`}
      </Text>
    </View>
  );
}
