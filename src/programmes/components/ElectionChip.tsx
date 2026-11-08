import { Link } from 'expo-router';
import React, { useMemo } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { appSelector } from '@/src/core/store/create-store';
import { electionChipViewModel } from '@/src/programmes/view-models/election-chip.view-model';

/** Pastille fixe de l'en-tête : « 2027 », puis « 2027 · J-161 » après l'hydratation. */
export function ElectionChip() {
  const { colors, effects, fonts } = useTheme();
  const hydrated = useHydrated();
  const select = useMemo(() => electionChipViewModel(hydrated), [hydrated]);
  const chip = appSelector(select);
  if (!chip) return null;
  return (
    <Link href={chip.href as never} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={chip.accessibilityLabel}
        hoverStyle={{ backgroundColor: colors.surface.hover }}
        style={{
          minHeight: 36,
          justifyContent: 'center',
          paddingHorizontal: 12,
          borderRadius: effects.borderRadius.round,
          borderWidth: 1.5,
          borderColor: colors.tintBorder,
          backgroundColor: colors.tintSoft,
        }}
      >
        <Text plainDigits style={{ ...fonts.bold, fontSize: 14, color: colors.tint }}>
          {chip.label}
        </Text>
      </Pressable>
    </Link>
  );
}
