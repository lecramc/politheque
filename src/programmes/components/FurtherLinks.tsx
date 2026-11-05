import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { tv } from '@/src/core/web/tv';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import type { PartyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * « Pour aller plus loin » : cartes-liens vers les onglets qui développent la fiche. Une colonne
 * sous 768 px, deux de 768 à 1023 px, trois à partir de 1024 px (CSS `grid-3`).
 */
export function FurtherLinks({ links }: { links: PartyViewModel['further'] }) {
  const { colors, effects, fonts } = useTheme();
  if (links.length === 0) return null;
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <SectionTitle>Pour aller plus loin</SectionTitle>
      <View {...tv('grid-3')} style={{ gap: effects.spacing.sm }}>
        {links.map((link) => (
          <Link key={link.key} href={link.href as never} asChild>
            <Pressable
              accessibilityRole="link"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                minWidth: 0,
                paddingHorizontal: effects.spacing.md,
                paddingVertical: 12,
                borderRadius: effects.borderRadius.small,
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
                backgroundColor: colors.surface.primary,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ ...fonts.bold, fontSize: 16, lineHeight: 22 }}>{link.title}</Text>
                {link.subtitle ? (
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    {link.subtitle}
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron-forward" variant="secondary" size="small" />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
