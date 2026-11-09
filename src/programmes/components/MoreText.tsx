import React, { ReactNode, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useColorStyle } from '@/components/webTheme';

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
  const c = useColorStyle();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        style={styles.toggle}
      >
        <Icon name={open ? 'chevron-down' : 'chevron-forward'} variant="onGlass" size="small" />
        <Text style={[styles.label, c((p) => ({ color: p.tint }))]}>{label}</Text>
      </Pressable>
      {open || Platform.OS === 'web' ? (
        <View style={[styles.root, open ? null : styles.hidden]} aria-hidden={!open}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: theme.effects.spacing.xs },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.effects.spacing.xxs,
    minHeight: 44,
  },
  label: { ...theme.fonts.bold, fontSize: 16 },
  hidden: { display: 'none' },
});
