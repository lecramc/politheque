import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';

/** État vide identique pour tous les partis : le résultat daté d'un périmètre publié. */
export function ProceduresEmpty({ reviewedOn }: { reviewedOn: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 16, lineHeight: 25, color: colors.text.secondary }}>
      Le recensement, arrêté au {reviewedOn}, ne compte aucune procédure répondant aux critères
      ci-dessus.
    </Text>
  );
}
