import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { Stance } from '@/src/programmes/models/programme.model';
import { STANCE_LABEL, STANCE_SHORT_LABEL } from '@/src/programmes/models/stance-labels';

export { STANCE_LABEL, STANCE_SHORT_LABEL };

const STANCE_SIGN: Record<string, string> = {
  '2': '+',
  '1': '+',
  '0': '=',
  '-1': '−',
  '-2': '−',
  null: '?',
};

/**
 * Position pour / contre : un rond avec « + » ou « − » et le libellé. Une seule teinte (tint) :
 * rond plein = position nette, contour = « plutôt », mitigée ou inconnue. L'intensité dit la force
 * de la position, jamais son sens : pas de vert / rouge. Le sens n'est jamais porté par la couleur.
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
  const { colors, effects, fonts } = useTheme();
  const key = String(stance);
  const strong = stance === 2 || stance === -2;
  const unknown = stance === null;
  const text = (label === 'full' ? STANCE_LABEL : STANCE_SHORT_LABEL)[key];
  return (
    <View
      role="img"
      aria-label={STANCE_LABEL[key]}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: effects.spacing.xs,
        flexShrink: variant === 'cell' ? 1 : 0,
        ...(variant === 'cell' ? { width: '100%' } : null),
      }}
    >
      <View
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderStyle: unknown ? 'dashed' : 'solid',
          borderColor: unknown ? colors.text.secondary : colors.tint,
          backgroundColor: strong ? colors.tint : 'transparent',
        }}
      >
        <Text
          style={{
            ...fonts.bold,
            fontSize: 16,
            lineHeight: 18,
            color: strong ? colors.text.onColor : unknown ? colors.text.secondary : colors.tint,
          }}
        >
          {STANCE_SIGN[key]}
        </Text>
      </View>
      <Text
        aria-hidden
        numberOfLines={variant === 'cell' ? 1 : undefined}
        style={{
          ...(strong ? fonts.bold : fonts.regular),
          fontSize: 15,
          flexShrink: 1,
          color: unknown ? colors.text.secondary : colors.text.primary,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
