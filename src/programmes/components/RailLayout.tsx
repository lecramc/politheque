import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { layout } from '@/components/layout';
import { useTheme } from '@/components/ThemeContext';
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
    return (
      <View {...tv('main')} style={styles.main}>
        {children}
      </View>
    );
  }
  return (
    <View {...tv('rail-layout')} style={{ gap: effects.spacing.lg }}>
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
  main: { width: '100%', minWidth: 0, maxWidth: layout.main.xl },
  rail: { width: '100%' },
});
