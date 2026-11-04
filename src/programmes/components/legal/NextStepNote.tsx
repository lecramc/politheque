import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { PresentedEntry } from '@/src/programmes/models/legal/legal-presentation';

export function NextStepNote({ nextStep }: { nextStep: NonNullable<PresentedEntry['nextStep']> }) {
  const { colors, effects } = useTheme();
  return (
    <View style={{ gap: effects.spacing.xs }}>
      <Text variant="caption">Prochaine étape</Text>
      <Text style={{ fontSize: 15, lineHeight: 23, color: colors.text.primary }}>
        {nextStep.text}
      </Text>
      <SourceChip sources={nextStep.sources} />
    </View>
  );
}
