import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { splitBullets } from '@/src/programmes/models/presentation.service';

/** Un paragraphe de contenu éditorial ; une ligne « - … » devient une puce. */
export function GuideParagraph({ text, small = false }: { text: string; small?: boolean }) {
  const { colors, effects } = useTheme();
  const { lead, bullets } = splitBullets(text);
  const style = small
    ? { fontSize: 15, lineHeight: 23, color: colors.text.secondary }
    : { fontSize: 17, lineHeight: 27 };
  return (
    <View style={{ gap: effects.spacing.xxs }}>
      <Text style={style}>{lead}</Text>
      {bullets.map((bullet) => (
        <Text key={bullet} style={[style, { paddingLeft: effects.spacing.sm }]}>
          {`• ${bullet}`}
        </Text>
      ))}
    </View>
  );
}
