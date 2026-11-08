import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { STANCE_SCALE } from '@/src/programmes/models/stance-labels';

/**
 * Légende de l'échelle des positions : les six badges dans l'ordre fixe de l'échelle, puis une
 * phrase. Identique pour tous les partis ; rond plein = position nette, contour = nuancée.
 */
export function StanceLegend() {
  const { colors, effects } = useTheme();
  return (
    <View
      role="group"
      aria-label="Légende de l'échelle des positions"
      style={{
        gap: effects.spacing.sm,
        padding: effects.spacing.smd,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        backgroundColor: colors.surface.secondary,
      }}
    >
      <Text variant="caption">Légende</Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: 20,
          rowGap: effects.spacing.xs,
        }}
      >
        {STANCE_SCALE.map((stance) => (
          <StanceBadge key={String(stance)} stance={stance} label="full" />
        ))}
      </View>
      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>
        Rond plein : position nette. Contour : position nuancée. Rond en pointillés : pas de
        position claire dans les sources. Une seule couleur pour toutes les positions : le sens se
        lit dans le symbole et le libellé, jamais dans la couleur.
      </Text>
    </View>
  );
}
