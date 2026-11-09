import React, { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { tv } from '@/src/core/web/tv';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> } & (
  | { from: 'md' | 'lg'; below?: never }
  | { below: 'md' | 'lg'; from?: never }
);

/**
 * Affiche un bloc seulement à partir de (ou sous) un seuil, par CSS : le HTML statique et le
 * premier rendu client sont identiques. Le bloc masqué est `display: none` (retiré aussi de
 * l'arbre d'accessibilité). Natif : `from` n'est pas rendu (mobile), `below` l'est toujours.
 */
export function Only({ from, below, style, children }: Props) {
  if (Platform.OS !== 'web') return from ? null : <>{children}</>;
  const name = from ? `only-from-${from}` : `only-below-${below}`;
  return (
    <View {...tv(name)} style={[styles.column, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ column: { flexDirection: 'column' } });
