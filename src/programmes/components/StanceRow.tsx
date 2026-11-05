import React from 'react';
import { StyleSheet, View } from 'react-native';

import { layout } from '@/components/layout';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { tv } from '@/src/core/web/tv';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import type { Stance } from '@/src/programmes/models/programme.model';

/**
 * Ligne « libellé long + position » (une affirmation, une question).
 * - Sous 768 px : le badge est sous le libellé, aligné sur son début ; le libellé garde toute la
 *   largeur et les ronds restent sur la verticale de gauche.
 * - À partir de 768 px (CSS `stance-row`) : le libellé à gauche, la cellule fixe de 152 px à droite.
 * Les propriétés surchargées par la CSS viennent de `StyleSheet.create`.
 */
export function StanceRow({
  label,
  stance,
  fontSize = 16,
}: {
  label: string;
  stance: Stance | null;
  fontSize?: number;
}) {
  return (
    <View {...tv('stance-row')} style={styles.row}>
      <Text
        {...tv('stance-row-label')}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.4) }}
      >
        {label}
      </Text>
      <View {...tv('stance-cell')} style={styles.cell}>
        <StanceBadge stance={stance} variant="cell" />
      </View>
    </View>
  );
}

/** En-tête de colonne (« Question / Position »), visible à partir de 768 px. */
export function StanceColumnHead({
  left,
  right,
  paddingHorizontal,
  gap = 16,
  endInset = 0,
  ruled = false,
}: {
  left: string;
  right: string;
  paddingHorizontal: number;
  gap?: number;
  /** Filet sous l'en-tête (quand il est le premier bloc d'un cadre). */
  ruled?: boolean;
  /** Espace fixe après la cellule (chevron de l'accordéon, par exemple). */
  endInset?: number;
}) {
  const { colors, fonts } = useTheme();
  const text = { ...fonts.bold, fontSize: 13, color: colors.text.secondary } as const;
  return (
    <View
      {...tv('colhead')}
      aria-hidden
      style={[
        styles.head,
        {
          paddingHorizontal,
          gap,
          borderBottomWidth: ruled ? 1 : 0,
          borderColor: colors.surface.border.primary,
        },
      ]}
    >
      <Text style={[text, styles.headLeft]}>{left}</Text>
      <View {...tv('stance-cell')} style={styles.cell}>
        <Text style={text}>{right}</Text>
      </View>
      {endInset > 0 ? <View style={{ width: endInset }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  cell: { alignSelf: 'flex-start', width: layout.stanceCell.base },
  head: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  headLeft: { flex: 1 },
});
