import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/** Présentation du parcours pour qui n'a encore rien lu (A1). */
export function JourneyIntro({ large = false }: { large?: boolean }) {
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
    </View>
  );
}
