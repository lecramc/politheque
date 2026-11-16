import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/** Bouton « Filtrer » (ou « Filtrer · 2 ») qui ouvre une feuille de filtres. */
export function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-haspopup="dialog"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: effects.spacing.xs,
        minHeight: 48,
        paddingHorizontal: effects.spacing.md,
        borderRadius: effects.borderRadius.input,
        borderWidth: 1.5,
        borderColor: active ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: active ? colors.tintSoft : 'transparent',
      }}
    >
      <Icon name="options-outline" variant="primary" size="small" />
      <Text style={active ? { ...fonts.bold, color: colors.tint } : undefined}>{label}</Text>
    </Pressable>
  );
}
