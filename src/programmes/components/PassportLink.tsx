import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/** Ligne « Ma progression · 3 tampons sur 6 ». Le compte est masqué tant que rien n'est chargé. */
export function PassportLink({ label }: { label: string | null }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Link href="/passeport" asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.sm,
          padding: effects.spacing.md,
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          backgroundColor: colors.surface.primary,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.tintSoft,
          }}
        >
          <Icon name="ribbon-outline" variant="onGlass" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...fonts.bold, fontSize: 17 }}>{JOURNEY_COPY.passportTitle}</Text>
          {/* Hauteur réservée : le texte apparaît sans décaler la page. */}
          <Text style={{ color: colors.text.secondary, opacity: label ? 1 : 0 }}>
            {label ?? ' '}
          </Text>
        </View>
        <Icon name="chevron-forward" variant="secondary" size="small" />
      </Pressable>
    </Link>
  );
}
