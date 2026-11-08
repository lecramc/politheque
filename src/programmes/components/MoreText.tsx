import React, { ReactNode, useState } from 'react';
import { Platform, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/**
 * « En savoir plus » / « Lire la suite » : le détail reste dans la page (présent dans le HTML,
 * masqué par display:none quand il est fermé) et à un clic. Aucun texte n'est supprimé ni réécrit.
 */
export function MoreText({
  label = 'En savoir plus',
  children,
}: {
  /** « En savoir plus » ou « Lire la suite » ; un libellé précis (« Ce qui les départage ») est permis. */
  label?: string;
  children: ReactNode;
}) {
  const { colors, effects, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: effects.spacing.xs }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: effects.spacing.xxs,
          minHeight: 44,
        }}
      >
        <Icon name={open ? 'chevron-down' : 'chevron-forward'} variant="onGlass" size="small" />
        <Text style={{ ...fonts.bold, fontSize: 16, color: colors.tint }}>{label}</Text>
      </Pressable>
      {open || Platform.OS === 'web' ? (
        <View
          style={[{ gap: effects.spacing.xs }, open ? null : { display: 'none' }]}
          aria-hidden={!open}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
