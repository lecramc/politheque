import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { LABELS_LINK } from '@/src/programmes/models/etiquettes.service';

/** Lien texte « D'où vient ce classement ? » sous les deux lignes d'étiquettes : ouvre la feuille. */
export function LabelsLink({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 15, color: colors.tint, textDecorationLine: 'underline' }}>
        {LABELS_LINK}
      </Text>
    </Pressable>
  );
}
