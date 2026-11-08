import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { STANCE_SCALE } from '@/src/programmes/models/stance-labels';

/** Explication longue de la légende, dans « Comment lire cette page » (une seule fois par page). */
export const STANCE_LEGEND_TEXT =
  'Rond plein : position nette. Contour : position nuancée. Rond en pointillés : pas de position claire dans les sources. Une seule couleur pour toutes les positions : le sens se lit dans le symbole et le libellé, jamais dans la couleur.';

/**
 * Légende de l'échelle des positions sur une ligne : les six badges (symbole et libellé) dans
 * l'ordre fixe de l'échelle. Identique pour tous les partis ; l'explication est dans la feuille.
 */
export function StanceLegend() {
  const { colors, effects } = useTheme();
  return (
    <View
      role="group"
      aria-label="Légende de l'échelle des positions"
      style={{
        padding: effects.spacing.smd,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        backgroundColor: colors.surface.secondary,
      }}
    >
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
    </View>
  );
}
