import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { PresentedEntry } from '@/src/programmes/models/legal/legal-presentation';

/** Étapes datées : date, juridiction, décision, peines, sources. */
export function LegalStepList({ steps }: { steps: PresentedEntry['steps'] }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderColor: colors.tintBorder,
        marginLeft: 6,
        gap: 14,
        paddingVertical: 4,
      }}
    >
      {steps.map((step, index) => (
        <View key={`${step.date}-${index}`} style={{ paddingLeft: 16, gap: 4 }}>
          <Text style={{ ...fonts.bold, color: colors.tint }}>{step.date}</Text>
          {step.court ? (
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>{step.court}</Text>
          ) : null}
          <Text style={{ fontSize: 16, lineHeight: 24 }}>{step.decision}</Text>
          {step.penalties.map((penalty) => (
            <Text key={penalty} style={{ fontSize: 15, lineHeight: 22 }}>
              Peine : {penalty}
            </Text>
          ))}
          <View style={{ marginTop: effects.spacing.xxs }}>
            <SourceChip sources={step.sources} />
          </View>
        </View>
      ))}
    </View>
  );
}
