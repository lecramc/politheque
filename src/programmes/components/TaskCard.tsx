import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/** Une tâche de l'accueil : icône, titre, une ligne. `primary` : la tâche d'engagement, en aplat. */
export function TaskCard({
  title,
  subtitle,
  icon,
  href,
  primary = false,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  href: string;
  primary?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const text = primary ? colors.text.onColor : colors.text.primary;
  return (
    <Link href={href as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.smd,
          minHeight: 72,
          padding: effects.spacing.md,
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: primary ? colors.tint : colors.surface.border.primary,
          backgroundColor: primary ? colors.tint : colors.surface.primary,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: effects.borderRadius.xs,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: primary ? 'rgba(255,255,255,0.18)' : colors.tintSoft,
          }}
        >
          <Icon name={icon} variant={primary ? 'onColor' : 'onGlass'} />
        </View>
        <View style={{ flex: 1, gap: effects.spacing.xxs }}>
          <Text style={{ ...fonts.displayBold, fontSize: 18, color: text }}>{title}</Text>
          {subtitle ? (
            <Text
              style={{ fontSize: 15, color: primary ? colors.text.onColor : colors.text.secondary }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}
