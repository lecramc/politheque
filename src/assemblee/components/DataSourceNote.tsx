import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { sourceNote } from '@/src/assemblee/models/source-note';

/** Source, licence, date d'extraction : sur la liste, chaque scrutin et la méthode. */
export function DataSourceNote({ source }: { source: ReturnType<typeof sourceNote> }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {source.line}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {source.detail}
      </Text>
    </View>
  );
}
