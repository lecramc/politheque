import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useColorStyle } from '@/components/webTheme';
import { scrollToId } from '@/src/core/web/browser-actions';
import { tv } from '@/src/core/web/tv';
import type { OnThisPageItem } from '@/src/programmes/models/on-this-page';

/**
 * Sommaire « Sur cette page » : liens d'ancre dans le flux, sous le titre, à toutes les largeurs
 * (pas de rail : voir `models/on-this-page.ts`). Sur le web, chaque lien est un vrai `<a href="#…">`
 * (fonctionne sans JavaScript) ; le clic fait en plus un défilement doux et, pour une entrée
 * `action`, prévient l'écran (ouvrir l'onglet « Comparer deux partis »).
 */
export function OnThisPage({
  items,
  onAction,
}: {
  items: OnThisPageItem[];
  onAction?: (action: NonNullable<OnThisPageItem['action']>) => void;
}) {
  const c = useColorStyle();
  return (
    <View role="navigation" aria-label="Sur cette page" style={styles.box}>
      <Text variant="caption">Sur cette page</Text>
      <View role="list" style={styles.list}>
        {items.map((item) => (
          <View key={item.label} role="listitem">
            <Text
              {...tv('text-link')}
              {...(Platform.OS === 'web' ? { href: `#${item.id}` } : null)}
              accessibilityRole="link"
              onPress={(event: { preventDefault?: () => void }) => {
                event?.preventDefault?.();
                if (item.action) onAction?.(item.action);
                scrollToId(item.id);
              }}
              style={[styles.link, c((p) => ({ color: p.tint }))]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: theme.effects.spacing.xs },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.effects.spacing.smd,
    rowGap: theme.effects.spacing.xs,
  },
  link: { ...theme.fonts.regular, fontSize: 15, textDecorationLine: 'underline' },
});
