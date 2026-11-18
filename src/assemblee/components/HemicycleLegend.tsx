import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { LegendEntry } from '@/src/assemblee/models/hemicycle-legend';

/**
 * Légende : les formes (le vote), puis une ligne pour la couleur (le groupe). Quatre entrées (pour, contre, abstention, n'a pas voté), deux
 * pour une motion de censure. Le repère de délégation n'est pas sur le schéma.
 */
export function HemicycleLegend({ entries }: { entries: LegendEntry[] }) {
  const { colors, effects } = useTheme();
  return (
    <View role="group" aria-label={COPY.legend.title} style={{ gap: 6 }}>
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: effects.spacing.md, rowGap: 6 }}
      >
        {entries.map((entry) => (
          <View key={entry.code} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <VoteGlyph glyph={entry.glyph} size={18} />
            <Text style={{ fontSize: 14, color: colors.text.primary }}>{entry.label}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {COPY.legend.groupColors}
      </Text>
    </View>
  );
}
