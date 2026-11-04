import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextStyle, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { useHydrated } from '@/src/core/hooks/useHydrated';

interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'primary' | 'secondary' | 'onGlass' | 'onColor' | 'success';
  style?: TextStyle;
  iconSet?: React.ComponentType<any>;
}

/**
 * Icon — themed icon primitive.
 *
 * Renders an Ionicons icon (or custom iconSet) sized and colored from the theme.
 *
 * Use when you need a standalone icon anywhere in the UI.
 * Do NOT use for button icons — IconButton handles that.
 */
export function Icon({
  name,
  size = 'medium',
  variant = 'primary',
  style,
  iconSet: IconSet = Ionicons,
}: IconProps) {
  const { colors, effects } = useTheme();

  const iconSize = effects.sizes.icon[size];
  // Le glyphe dépend de la police d'icônes, chargée côté client seulement : avant l'hydratation,
  // une boîte de la même taille (HTML statique et premier rendu client identiques, sans saut de mise en page).
  const hydrated = useHydrated();
  if (!hydrated) return <View aria-hidden style={{ width: iconSize, height: iconSize }} />;

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'onGlass':
        return colors.tint;
      case 'onColor':
        return colors.text.onColor;
      case 'success':
        return colors.accent.success;
      default:
        return colors.text.primary;
    }
  };

  return <IconSet name={name} size={iconSize} color={getIconColor()} style={[style]} />;
}
