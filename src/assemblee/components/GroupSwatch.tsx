import React from 'react';
import { View } from 'react-native';

import { useMarkOutline } from '@/src/core/hooks/useMarkOutline';

/**
 * Pastille de la couleur officielle d'un groupe à l'Assemblée. Décorative : le sigle est toujours
 * écrit à côté, la couleur n'est jamais la seule information. Le contour (plus marqué pour les couleurs qui se confondent avec le fond) garde visibles les
 * couleurs claires (HOR, SOC, LIOT) sur fond crème et les foncées (RN) sur fond sombre.
 */
export function GroupSwatch({
  color,
  size = 14,
  lineHeight,
}: {
  color: string;
  size?: number;
  /** Hauteur de la première ligne du libellé voisin : la pastille s'y centre (parent en `flex-start`). */
  lineHeight?: number;
}) {
  const outline = useMarkOutline(color);
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        marginTop: lineHeight ? (lineHeight - size) / 2 : 0,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: outline,
      }}
    />
  );
}
