import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/** Bloc repliable : titre + phrase-clé fermé, détail ouvert. */
export function Accordion({
  title,
  subtitle,
  leading,
  trailing,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  children,
  flat = false,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
  /** Sans carte, pour une liste dans un conteneur existant. */
  flat?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const reduceMotion = useReducedMotion();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const toggle = () => {
    setLocalOpen(!open);
    onToggle?.(!open);
  };

  return (
    <View
      style={
        flat
          ? { borderBottomWidth: 1, borderColor: colors.surface.border.primary }
          : {
              backgroundColor: colors.surface.primary,
              borderWidth: 1,
              borderColor: colors.surface.border.primary,
              borderRadius: effects.borderRadius.small,
              overflow: 'hidden',
            }
      }
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 56,
          paddingHorizontal: flat ? 0 : effects.spacing.md,
          paddingVertical: 12,
        }}
      >
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ ...fonts.bold, fontSize: 16, color: colors.text.primary }}>{title}</Text>
          {subtitle && !open ? (
            <Text style={{ fontSize: 14, color: colors.text.secondary }} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" variant="onGlass" size="small" />
        </View>
      </Pressable>
      {open ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          style={{
            paddingHorizontal: flat ? 0 : effects.spacing.md,
            paddingBottom: effects.spacing.md,
            gap: effects.spacing.sm,
          }}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}
