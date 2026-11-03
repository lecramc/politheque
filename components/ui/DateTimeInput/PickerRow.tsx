import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text, View } from '@/components/Themed';

type PickerRowProps = {
  label?: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
  grouped?: boolean;
  accessibilityHint?: string;
  // On native surfaces (BottomSheet) the row must follow the OS theme, not the
  // app toggle, to stay legible when they diverge. See ThemeContext systemColors.
  onGlass?: boolean;
};

export default function PickerRow({
  label,
  value,
  onPress,
  disabled = false,
  grouped = false,
  accessibilityHint,
  onGlass = false,
}: PickerRowProps) {
  const { colors: appColors, systemColors, effects } = useTheme();
  const colors = onGlass ? systemColors : appColors;

  const accessibilityLabel = label ? `${label} ${value}` : value;

  if (grouped) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.groupedRow,
          {
            height: effects.sizes.input.md,
            backgroundColor: pressed && !disabled ? colors.surface.tertiary : 'transparent',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {label && (
          <Text
            style={[
              styles.groupedLabel,
              { color: colors.text.secondary, fontSize: effects.sizes.text.label },
            ]}
          >
            {label}
          </Text>
        )}
        <Text
          style={[
            styles.groupedValue,
            { color: colors.text.primary, fontSize: effects.sizes.text.secondary },
          ]}
        >
          {value}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{ opacity: disabled ? 0.5 : 1 }}>
      {label && (
        <Text
          style={[
            styles.standaloneLabel,
            { color: colors.text.secondary, fontSize: effects.sizes.text.label },
          ]}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.standaloneRow,
          {
            height: effects.sizes.input.md,
            backgroundColor: pressed ? colors.surface.tertiary : colors.surface.secondary,
            borderColor: colors.surface.border.primary,
            borderRadius: effects.borderRadius.input,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            styles.standaloneValue,
            { color: colors.text.primary, fontSize: effects.sizes.text.secondary },
          ]}
        >
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  standaloneLabel: {
    marginBottom: 6,
    fontWeight: '500',
  },
  standaloneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  standaloneValue: {
    fontWeight: '600',
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  groupedLabel: {
    fontWeight: '500',
  },
  groupedValue: {
    fontWeight: '600',
  },
});
