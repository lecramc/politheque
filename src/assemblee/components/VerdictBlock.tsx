import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { VoteBar } from '@/src/assemblee/components/VoteBar';
import type { Verdict } from '@/src/assemblee/models/scrutin-verdict';

const MEASURE = 680;

/**
 * Le verdict, juste sous le titre : le résultat en une phrase, les décomptes, ce qu'il fallait.
 * Même gabarit pour tous les votes, sans couleur de réussite ou d'échec (icône neutre).
 */
export function VerdictBlock({ verdict }: { verdict: Verdict }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View
      role="group"
      aria-label={verdict.headline}
      style={{
        gap: effects.spacing.xs,
        padding: effects.spacing.md,
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        borderRadius: effects.borderRadius.small,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: effects.spacing.xs }}>
        <Icon
          name={verdict.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
          variant="secondary"
          size="large"
        />
        <Text
          headingLevel={2}
          style={{ ...fonts.bold, fontSize: 24, lineHeight: 30, flex: 1, maxWidth: MEASURE }}
        >
          {verdict.headline}
        </Text>
      </View>
      {verdict.kind === 'standard' ? (
        <>
          <Text plainDigits style={{ fontSize: 18, lineHeight: 26 }}>
            {verdict.counts}
          </Text>
          <VoteBar
            segments={verdict.bar.segments}
            total={verdict.bar.total}
            threshold={verdict.bar.threshold}
          />
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
            {verdict.threshold}
          </Text>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 17, lineHeight: 26, maxWidth: MEASURE }}>{verdict.detail}</Text>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 23,
              color: colors.text.secondary,
              maxWidth: MEASURE,
            }}
          >
            {verdict.note}
          </Text>
        </>
      )}
    </View>
  );
}
