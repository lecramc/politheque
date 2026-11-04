import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Card } from '@/src/programmes/components/Card';
import { Stamp } from '@/src/programmes/components/Stamp';

/** Grille à deux colonnes de mini-tampons nommés (partis, débats). Même tampon pour tous. */
export function StampGrid({
  title,
  countLabel,
  items,
}: {
  title: string;
  /** null avant le chargement : la ligne garde sa hauteur sans afficher de compte. */
  countLabel: string | null;
  items: { key: string; title: string; href: string; state: 'stamped' | 'empty' }[];
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Card>
      <Text style={{ ...fonts.display, fontSize: 20 }}>{title}</Text>
      <Text style={{ color: colors.text.secondary, opacity: countLabel ? 1 : 0 }}>
        {countLabel ?? ' '}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: effects.spacing.xs }}>
        {items.map((item) => (
          <View key={item.key} style={{ width: '50%' }}>
            <Link href={item.href as never} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${item.title}, ${item.state === 'stamped' ? 'lu' : 'à découvrir'}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: effects.spacing.xs,
                  minHeight: 44,
                  paddingRight: effects.spacing.xs,
                }}
              >
                <Stamp state={item.state} size="badge" />
                <Text style={{ flex: 1, fontSize: 14 }}>{item.title}</Text>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </Card>
  );
}
