import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { LogoMark } from '@/src/programmes/components/Logo';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/**
 * Arrivée du chemin : seul endroit du parcours où le tricolore apparaît (demi-cocarde du logo).
 * Atténuée tant que les six tampons ne sont pas obtenus, pleine ensuite.
 */
export function JourneyArrival({
  finished,
  animateIn = false,
}: {
  finished: boolean;
  /** Le dernier tampon vient d'être obtenu pendant cette session : le logo « arrive ». */
  animateIn?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.sm }}>
      <View style={{ width: 84, alignItems: 'center' }}>
        <LogoMark height={40} muted={!finished} animateIn={animateIn && finished} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...fonts.bold, fontSize: 17 }}>{JOURNEY_COPY.arrivalKicker}</Text>
        <Text style={{ color: colors.text.secondary }}>{JOURNEY_COPY.arrivalText}</Text>
      </View>
    </View>
  );
}
