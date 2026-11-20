import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { LawJourneyStep } from '@/src/programmes/models/law-journey.copy';

const BULLET = 30;

/**
 * Frise verticale du parcours d'une loi : liste ordonnée, une phrase et son article par étape.
 * Verticale à toutes les largeurs (lisible dès 375 px). Aucune animation.
 */
export function LawJourney({ steps }: { steps: readonly LawJourneyStep[] }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        borderRadius: effects.borderRadius.small,
        padding: effects.spacing.md,
        gap: effects.spacing.sm,
      }}
    >
      <Text variant="caption" headingLevel={2}>
        Le parcours d'une loi en huit étapes
      </Text>
      <View role="list" aria-label="Les étapes du parcours d'une loi">
        {steps.map((step, index) => (
          <View
            key={step.id}
            role="listitem"
            style={{ flexDirection: 'row', gap: effects.spacing.sm }}
          >
            <View style={{ alignItems: 'center', width: BULLET }}>
              <View
                style={{
                  width: BULLET,
                  height: BULLET,
                  borderRadius: effects.borderRadius.round,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: step.optional ? colors.surface.primary : colors.tintSoft,
                  borderWidth: 1,
                  borderColor: step.optional ? colors.surface.border.secondary : colors.tintBorder,
                }}
              >
                <Text plainDigits style={{ ...fonts.bold, fontSize: 14, color: colors.tint }}>
                  {index + 1}
                </Text>
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={{ flex: 1, width: 2, backgroundColor: colors.surface.border.primary }}
                />
              ) : null}
            </View>
            <View
              style={{
                flex: 1,
                minWidth: 0,
                gap: effects.spacing.xxs,
                paddingBottom: index < steps.length - 1 ? effects.spacing.md : 0,
              }}
            >
              <Text style={{ ...fonts.bold, fontSize: 16 }}>
                {step.title}
                {step.optional ? (
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {' · si besoin'}
                  </Text>
                ) : null}
              </Text>
              <Text style={{ fontSize: 16, lineHeight: 24 }}>{step.text}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                {`Article ${step.article} de la Constitution`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
