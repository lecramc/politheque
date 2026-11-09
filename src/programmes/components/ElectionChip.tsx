import { Link, usePathname } from 'expo-router';
import React, { useMemo } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { appSelector } from '@/src/core/store/create-store';
import { electionChipViewModel } from '@/src/programmes/view-models/election-chip.view-model';

/** Largeur de « 2027 · J-160 » (texte gras de 14 px, marges et bordure comprises). */
const CHIP_MIN_WIDTH = 112;

/** Pastille fixe de l'en-tête : « 2027 », puis « 2027 · J-161 » après l'hydratation. */
export function ElectionChip() {
  const { colors, effects, fonts } = useTheme();
  const hydrated = useHydrated();
  const select = useMemo(() => electionChipViewModel(hydrated), [hydrated]);
  const chip = appSelector(select);
  const pathname = usePathname();
  if (!chip) return null;
  // Sur les pages d'élection, la pastille est l'état actif de l'en-tête (comme une rubrique).
  const active = pathname.startsWith('/elections');
  return (
    <Link href={chip.href as never} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={chip.accessibilityLabel}
        aria-current={active ? 'page' : undefined}
        hoverStyle={{ backgroundColor: colors.surface.hover }}
        style={{
          minHeight: 36,
          // Largeur réservée : « 2027 » (statique) devient « 2027 · J-n » sans décaler la navigation.
          minWidth: CHIP_MIN_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
          borderRadius: effects.borderRadius.round,
          borderWidth: 1.5,
          borderColor: colors.tintBorder,
          backgroundColor: active ? colors.tint : colors.tintSoft,
        }}
      >
        <Text
          plainDigits
          style={{ ...fonts.bold, fontSize: 14, color: active ? colors.text.onColor : colors.tint }}
        >
          {chip.label}
        </Text>
      </Pressable>
    </Link>
  );
}
