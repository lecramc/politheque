import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/**
 * Présentation du parcours : le titre, la promesse du site (neutre, sourcé, daté) et les deux
 * actions, « Commencer le parcours » et « Me situer ».
 */
export function JourneyIntro({
  large = false,
  startHref = '/parcours/les-bases',
}: {
  large?: boolean;
  startHref?: string;
}) {
  const { colors, effects } = useTheme();
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <Text variant="caption">{JOURNEY_COPY.introKicker}</Text>
      <Text variant="title" style={{ fontSize: large ? 40 : 30, lineHeight: large ? 46 : 36 }}>
        {JOURNEY_COPY.introTitle}
      </Text>
      <Text style={{ color: colors.text.secondary, fontSize: large ? 18 : 16 }}>
        {JOURNEY_COPY.introLead}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
        <Button variant="brand" fullWidth={false} href={startHref}>
          {JOURNEY_COPY.introStart}
        </Button>
        <Button variant="secondary" fullWidth={false} href="/me-situer">
          {JOURNEY_COPY.introQuiz}
        </Button>
      </View>
    </View>
  );
}
