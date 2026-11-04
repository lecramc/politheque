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

const STANCE_SIGN: Record<string, string> = {
  '2': '+',
  '1': '+',
  '0': '=',
  '-1': '−',
  '-2': '−',
  null: '?',
};

/**
 * Position pour / contre : un rond avec « + » ou « − » et le libellé. Une seule teinte (tint) :
 * rond plein = position nette, contour = « plutôt », mitigée ou inconnue. L'intensité dit la force
 * de la position, jamais son sens : pas de vert / rouge. Le sens n'est jamais porté par la couleur.
 */
export function StanceBadge({ stance }: { stance: Stance | null }) {
  const { colors, fonts } = useTheme();
  const key = String(stance);
  const strong = stance === 2 || stance === -2;
  const unknown = stance === null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <View
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderStyle: unknown ? 'dashed' : 'solid',
          borderColor: unknown ? colors.text.secondary : colors.tint,
          backgroundColor: strong ? colors.tint : 'transparent',
        }}
      >
        <Text
          style={{
            ...fonts.bold,
            fontSize: 16,
            lineHeight: 18,
            color: strong ? colors.text.onColor : unknown ? colors.text.secondary : colors.tint,
          }}
        >
          {STANCE_SIGN[key]}
        </Text>
      </View>
      <Text
        style={{
          ...(strong ? fonts.bold : fonts.regular),
          fontSize: 15,
          color: unknown ? colors.text.secondary : colors.text.primary,
        }}
      >
        {STANCE_LABEL[key]}
      </Text>
    </View>
  );
}
