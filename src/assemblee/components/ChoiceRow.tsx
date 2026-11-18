import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';

/** Zone tactile minimale et hauteur de la ligne du libellé : la pastille et la coche s'y centrent. */
const ROW_MIN_HEIGHT = 44;
const LINE_HEIGHT = 24;

/**
 * Un choix unique dans une feuille de filtres : libellé, ligne d'aide, coche quand il est choisi.
 * Cible tactile d'au moins 44 px ; le choix se lit aussi sans couleur (coche et gras).
 */
export function ChoiceRow({
  label,
  help,
  color,
  selected,
  onPress,
}: {
  label: string;
  help?: string;
  /** Couleur officielle d'un groupe : pastille devant le libellé, qui reste écrit. */
  color?: string;
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
        alignItems: 'flex-start',
        gap: effects.spacing.sm,
        minHeight: ROW_MIN_HEIGHT,
        paddingVertical: (ROW_MIN_HEIGHT - LINE_HEIGHT) / 2,
        paddingHorizontal: effects.spacing.sm,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1.5,
        borderColor: selected ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: selected ? colors.tintSoft : 'transparent',
      }}
    >
      {color ? <GroupSwatch color={color} lineHeight={LINE_HEIGHT} /> : null}
      <View style={{ flex: 1, gap: effects.spacing.xxs }}>
        <Text style={selected ? { ...fonts.bold, color: colors.tint } : undefined}>{label}</Text>
        {help ? (
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>{help}</Text>
        ) : null}
      </View>
      <View
        style={{ width: 22, height: LINE_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
      >
        {selected ? <Icon name="checkmark" variant="primary" size="small" /> : null}
      </View>
    </Pressable>
  );
}
