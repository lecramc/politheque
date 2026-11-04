import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Card } from '@/src/programmes/components/Card';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import type { PresentedCorrection } from '@/src/programmes/view-models/corrections.view-model';

/** Une entrée du journal : date, type (pastille neutre), résumé, liens vers les pages concernées. */
export function CorrectionItem({ item }: { item: PresentedCorrection }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View id={item.id}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.sm }}>
          <StatusChip label={item.kindLabel} />
          <Text style={{ ...fonts.bold, color: colors.text.secondary, fontSize: 14 }}>
            {item.dateLabel}
          </Text>
        </View>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{item.summary}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
          {item.pages.map((page) => (
            <Link
              key={page.path}
              href={page.path as never}
              style={{ color: colors.tint, textDecorationLine: 'underline', fontSize: 14 }}
            >
              {page.label} →
            </Link>
          ))}
        </View>
      </Card>
    </View>
  );
}
