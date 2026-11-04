import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import type { JourneyNewsModel } from '@/src/programmes/view-models/journey.view-model';

/** Actualité de l'élection mise en avant : une ligne (mobile) ou une carte (desktop). */
export function NewsBanner({
  news,
  variant,
}: {
  news: JourneyNewsModel;
  variant: 'line' | 'card';
}) {
  const { colors, effects, fonts } = useTheme();
  const detail = [
    news.roundLabel && news.dateLabel ? `${news.roundLabel} le ${news.dateLabel}` : null,
    news.daysLeft !== null ? `J-${news.daysLeft}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  if (variant === 'line') {
    return (
      <Link href={news.href as never} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${news.title}. ${detail}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: effects.spacing.xs,
            minHeight: 44,
            paddingHorizontal: effects.spacing.sm,
            borderRadius: effects.borderRadius.small,
            backgroundColor: colors.tintSoft,
          }}
        >
          <Icon name="calendar-outline" variant="onGlass" size="small" />
          <Text style={{ flex: 1, fontSize: 14 }} numberOfLines={2}>
            <Text style={{ ...fonts.bold, fontSize: 14 }}>{news.title}</Text>
            {detail ? ` · ${detail}` : ''}
          </Text>
          <Icon name="chevron-forward" variant="onGlass" size="small" />
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={news.href as never} asChild>
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
          <Icon name="calendar-outline" variant="onGlass" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...fonts.bold, fontSize: 17 }}>{news.title}</Text>
          {detail ? <Text style={{ color: colors.text.secondary }}>{detail}</Text> : null}
        </View>
      </Pressable>
    </Link>
  );
}
