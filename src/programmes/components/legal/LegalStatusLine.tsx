import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { StatusChip } from '@/src/programmes/components/StatusChip';

/**
 * Statut juridique exact (pastille unique et neutre : aucune couleur ne juge) et, collé à lui,
 * le rappel de présomption d'innocence, visible sans rien ouvrir.
 */
export function LegalStatusLine({
  statusLabel,
  presumptionNotice,
}: {
  statusLabel: string;
  presumptionNotice: string | null;
}) {
  const { colors, effects } = useTheme();
  return (
    <View style={{ gap: effects.spacing.xs }}>
      <StatusChip label={statusLabel} />
      {presumptionNotice ? (
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
          {presumptionNotice}
        </Text>
      ) : null}
    </View>
  );
}
