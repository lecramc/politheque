import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useColorStyle } from '@/components/webTheme';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import type { Stance } from '@/src/programmes/models/programme.model';
import { STANCE_LABEL, STANCE_SHORT_LABEL } from '@/src/programmes/models/stance-labels';
import { glyphOfStance } from '@/src/programmes/models/stance-scale';

export { STANCE_LABEL, STANCE_SHORT_LABEL };

/**
 * Position pour / contre : la forme de la grammaire commune (`stance-scale.ts`, la même que celle
 * des votes de l'Assemblée) et le libellé. Pour = disque plein, Contre = disque barré, « plutôt » =
 * les mêmes formes en contour, Mitigé = contour et « = », pas de position claire = pointillés.
 * Couleurs `colors.vote` (ni vert ni rouge) ; le sens n'est jamais porté par la couleur seule.
 *
 * - `inline` : largeur du contenu (feuille de justification, sous une affirmation).
 * - `cell` : remplit la cellule fixe que lui donne son parent ; le rond est collé à gauche, le
 *   libellé reste sur une ligne. Tous les ronds d'une liste tombent sur la même verticale.
 *
 * Libellé court dans les listes (`short`), complet dans les feuilles (`full`). Le libellé complet
 * est toujours celui lu par les lecteurs d'écran.
 */
export function StanceBadge({
  stance,
  variant = 'inline',
  label = 'short',
}: {
  stance: Stance | null;
  variant?: 'inline' | 'cell';
  label?: 'short' | 'full';
}) {
  const c = useColorStyle();
  const key = String(stance);
  const strong = stance === 2 || stance === -2;
  const unknown = stance === null;
  const text = (label === 'full' ? STANCE_LABEL : STANCE_SHORT_LABEL)[key];
  return (
    <View
      role="img"
      aria-label={STANCE_LABEL[key]}
      style={variant === 'cell' ? styles.rootCell : styles.root}
    >
      <View style={styles.mark}>
        <VoteGlyph glyph={glyphOfStance(stance)} size={24} />
      </View>
      <Text
        aria-hidden
        numberOfLines={variant === 'cell' ? 1 : undefined}
        style={[
          strong ? styles.labelStrong : styles.label,
          c((p) => ({ color: unknown ? p.text.secondary : p.text.primary })),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

// Partie statique dans une feuille de style (classes sur le web) ; seules les couleurs varient.
const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.effects.spacing.xs,
    flexShrink: 0,
  },
  rootCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.effects.spacing.xs,
    flexShrink: 1,
    width: '100%',
  },
  mark: { width: 24, height: 24, flexShrink: 0 },
  label: { ...theme.fonts.regular, fontSize: 15, flexShrink: 1 },
  labelStrong: { ...theme.fonts.bold, fontSize: 15, flexShrink: 1 },
});
