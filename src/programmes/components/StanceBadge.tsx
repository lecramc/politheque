import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { Stance } from '@/src/programmes/models/programme.model';

export const STANCE_LABEL: Record<string, string> = {
  '2': 'Pour',
  '1': 'Plutôt pour',
  '0': 'Mitigé',
  '-1': 'Plutôt contre',
  '-2': 'Contre',
  null: 'Pas de position claire',
};

const STANCE_SYMBOL: Record<string, string> = {
  '2': '++',
  '1': '+',
  '0': '=',
  '-1': '−',
  '-2': '−−',
  null: '?',
};

/**
 * Position pour / contre : une seule teinte (tint), un symbole et un libellé.
 * L'intensité dit la force de la position, jamais son sens : pas de vert / rouge.
 */
export function StanceBadge({ stance }: { stance: Stance | null }) {
  const { colors, effects, fonts } = useTheme();
  const key = String(stance);
  const strong = stance === 2 || stance === -2;
  const unknown = stance === null;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1,
        borderStyle: unknown ? 'dashed' : 'solid',
        borderColor: unknown ? colors.surface.border.tertiary : colors.tint,
        backgroundColor: strong ? colors.tint : unknown ? 'transparent' : colors.tintSoft,
      }}
    >
      <Text
        style={{
          ...fonts.bold,
          fontSize: 13,
          color: strong ? colors.text.onColor : unknown ? colors.text.secondary : colors.tint,
        }}
      >
        {STANCE_SYMBOL[key]} {STANCE_LABEL[key]}
      </Text>
    </View>
  );
}
