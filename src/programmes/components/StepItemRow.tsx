import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { Stamp } from '@/src/programmes/components/Stamp';

type Item = {
  title: string;
  href: string;
  kind: string;
  partyColor?: string;
  statusLabel: string;
  stamp: { state: 'stamped' | 'empty' };
};

/**
 * Ligne d'un contenu de l'étape : anneau du parti (comme partout sur le site) ou icône,
 * titre, état en toutes lettres, et le même tampon pour tous à droite.
 */
export function StepItemRow({ item, last }: { item: Item; last: boolean }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Link href={item.href as never} asChild>
      <Pressable
        ring="inside"
        accessibilityRole="link"
        accessibilityLabel={`${item.title}, ${item.statusLabel}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.sm,
          minHeight: 64,
          paddingHorizontal: effects.spacing.md,
          paddingVertical: effects.spacing.xs,
          borderBottomWidth: last ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        {item.partyColor ? (
          <PartyDot color={item.partyColor} size={24} />
        ) : (
          <Icon name="document-text-outline" variant="onGlass" />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ ...fonts.bold, fontSize: 17 }}>{item.title}</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{item.statusLabel}</Text>
        </View>
        <Stamp state={item.stamp.state} size="row" />
      </Pressable>
    </Link>
  );
}
