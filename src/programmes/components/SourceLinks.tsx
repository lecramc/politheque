import React from 'react';
import { Linking, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { Source, SourceKind } from '@/src/programmes/models/programme.model';

const KIND_LABEL: Record<SourceKind, string> = {
  programme: 'Programme',
  declaration: 'Déclaration',
  vote: 'Vote',
  'proposition-de-loi': 'Proposition de loi',
  presse: 'Presse',
  statistique: 'Source officielle',
};

export const formatSourceDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  if (!month) return year;
  return day ? `${day}/${month}/${year}` : `${month}/${year}`;
};

export function SourceLinks({ sources }: { sources: Source[] }) {
  const { colors } = useTheme();
  if (sources.length === 0) return null;
  return (
    <View style={{ gap: 2 }}>
      {sources.map((source) => (
        <Text
          key={source.url + source.title}
          accessibilityRole="link"
          onPress={() => Linking.openURL(source.url)}
          style={{ fontSize: 13, color: colors.text.secondary }}
        >
          <Text style={{ fontSize: 13, color: colors.text.secondary }}>
            [{KIND_LABEL[source.kind] ?? source.kind} · {formatSourceDate(source.date)}]{' '}
          </Text>
          <Text style={{ fontSize: 13, color: colors.tint, textDecorationLine: 'underline' }}>
            {source.title}
          </Text>
        </Text>
      ))}
    </View>
  );
}
