import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/**
 * Un choix unique dans une feuille de filtres : libellé, ligne d'aide, coche quand il est choisi.
 * Cible tactile d'au moins 44 px ; le choix se lit aussi sans couleur (coche et gras).
 */
export function ChoiceRow({
  label,
  help,
  selected,
  onPress,
}: {
  label: string;
  help?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: effects.spacing.sm,
        minHeight: 44,
        paddingVertical: 8,
        paddingHorizontal: effects.spacing.sm,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1.5,
        borderColor: selected ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: selected ? colors.tintSoft : 'transparent',
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={selected ? { ...fonts.bold, color: colors.tint } : undefined}>{label}</Text>
        {help ? (
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>{help}</Text>
        ) : null}
      </View>
      <View style={{ width: 22, alignItems: 'center' }}>
        {selected ? <Icon name="checkmark" variant="primary" size="small" /> : null}
      </View>
    </Pressable>
  );
}
