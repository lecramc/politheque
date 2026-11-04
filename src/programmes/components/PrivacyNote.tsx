import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/** « Votre progression reste sur cet appareil. Rien n'est envoyé. Effacer » */
export function PrivacyNote({ onClear }: { onClear: () => void }) {
  const { colors, effects } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: effects.spacing.xs }}>
      <Icon name="phone-portrait-outline" variant="secondary" size="small" />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{JOURNEY_COPY.privacy}</Text>
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Effacer ma progression"
          style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
        >
          <Text style={{ color: colors.tint, textDecorationLine: 'underline', fontSize: 14 }}>
            {JOURNEY_COPY.clear}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
