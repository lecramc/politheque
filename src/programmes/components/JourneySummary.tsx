import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Arc } from '@/src/programmes/components/Arc';
import type { JourneySummaryModel } from '@/src/programmes/view-models/journey.view-model';

/** Résumé « 3 sur 6 étapes » et prochaine étape conseillée (A2). Aucun score, aucun niveau. */
export function JourneySummary({
  summary,
  stacked = false,
}: {
  summary: JourneySummaryModel;
  /** Desktop (colonne étroite) : arc au-dessus, texte dessous. */
  stacked?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <LinearGradient
      colors={[colors.pastel.bleu, colors.pastel.creme, colors.pastel.rose]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: effects.spacing.md,
        padding: effects.spacing.md,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
      }}
    >
      <Arc
        value={summary.total ? summary.stampedCount / summary.total : 0}
        size={stacked ? 220 : 130}
        strokeWidth={stacked ? 16 : 12}
        accessibilityLabel={summary.label}
      >
        <Text
          style={{
            ...fonts.displayBold,
            fontSize: stacked ? 52 : 40,
            lineHeight: stacked ? 58 : 44,
            color: colors.tint,
          }}
        >
          {summary.stampedCount}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          sur {summary.total} étapes
        </Text>
      </Arc>
      {summary.next ? (
        <View style={{ flex: stacked ? undefined : 1, alignSelf: 'stretch', gap: 6 }}>
          <Text variant="caption">Prochaine étape conseillée</Text>
          <Text style={{ ...fonts.display, fontSize: 22 }}>{summary.next.title}</Text>
          <Text style={{ color: colors.text.secondary }}>{summary.next.meta}</Text>
          <Link href={summary.next.href as never} asChild>
            <Pressable
              accessibilityRole="link"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                borderRadius: effects.borderRadius.round,
                backgroundColor: colors.tint,
                marginTop: 6,
              }}
            >
              <Text style={{ ...fonts.bold, fontSize: 17, color: colors.text.onColor }}>
                {summary.next.cta}
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : null}
    </LinearGradient>
  );
}
