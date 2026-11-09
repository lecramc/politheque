import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { layout } from '@/components/layout';
import { theme, useTheme } from '@/components/ThemeContext';
import { tv } from '@/src/core/web/tv';

/**
 * Gabarit rail + colonne. Mobile : le rail est empilé au-dessus (`stack`) ou absent (`hidden`).
 * À partir de 1024 px, la CSS (`rail-layout`) pose deux colonnes ; le rail est collant.
 * Les propriétés que la CSS surcharge (`display`, `max-width`) viennent de `StyleSheet.create`.
 */
export function RailLayout({
  rail,
  railOnMobile = 'stack',
  children,
}: {
  rail?: ReactNode;
  railOnMobile?: 'stack' | 'hidden';
  children: ReactNode;
}) {
  const { effects } = useTheme();
  if (!rail) {
    // Colonne de lecture seule : la CSS la centre dans le conteneur à partir de 1024 px (`solo`).
    return (
      <View {...tv('main', 'solo')} style={styles.main}>
        {children}
      </View>
    );
  }
  return (
    <View {...tv('rail-layout')} style={styles.layout}>
      {railOnMobile === 'hidden' ? (
        Platform.OS === 'web' ? (
          <View {...tv('rail', 'only-from-lg')} style={[styles.rail, { gap: effects.spacing.md }]}>
            {rail}
          </View>
        ) : null
      ) : (
        <View {...tv('rail')} style={[styles.rail, { gap: effects.spacing.md }]}>
          {rail}
        </View>
      )}
      <View {...tv('main')} style={styles.main}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // `rowGap` (empilement mobile) et non `gap` : la CSS desktop pose `column-gap` (gouttière du
  // rail), et un `gap` en ligne l'écraserait (28 px au lieu de 56).
  layout: { rowGap: theme.effects.spacing.lg },
  main: { width: '100%', minWidth: 0, maxWidth: layout.main.xl },
  rail: { width: '100%' },
});
