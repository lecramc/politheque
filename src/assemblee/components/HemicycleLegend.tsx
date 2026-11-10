import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { t } from '@/src/assemblee/i18n/translate';
import { orderedPositions, positionLabel } from '@/src/assemblee/models/deputy-table';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';
import type { SeatGlyph } from '@/src/assemblee/models/seat-view';

const GLYPH: Record<Exclude<VoteCode, '.'>, SeatGlyph> = {
  P: 'disc',
  C: 'disc-slash',
  A: 'ring',
  N: 'dot',
  '-': 'dashed',
};

/**
 * Légende textuelle des formes. Motion de censure : l'Assemblée ne recense que les voix pour, il
 * n'y a ni « contre » ni abstention à légender.
 */
export function HemicycleLegend({ censure }: { censure: boolean }) {
  const { colors, effects } = useTheme();
  const codes = orderedPositions(['P', 'C', 'A', 'N', '-'], censure) as Exclude<VoteCode, '.'>[];
  return (
    <View
      role="group"
      aria-label={t('legend.title')}
      style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: effects.spacing.md, rowGap: 6 }}
    >
      {codes.map((code) => (
        <View key={code} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <VoteGlyph glyph={GLYPH[code]} size={18} />
          <Text style={{ fontSize: 14, color: colors.text.primary }}>
            {positionLabel(code, censure)}
          </Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <VoteGlyph glyph="disc" delegation size={18} />
        <Text style={{ fontSize: 14, color: colors.text.primary }}>{t('legend.delegation')}</Text>
      </View>
    </View>
  );
}
