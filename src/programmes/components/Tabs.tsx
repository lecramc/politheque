import React from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

/** Onglets soulignés (bleu uni), défilants horizontalement sur petit écran. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: colors.surface.border.primary }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const active = tab.id === value;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                paddingHorizontal: 14,
                borderBottomWidth: 3,
                borderColor: active ? colors.tint : 'transparent',
                marginBottom: -1,
              }}
            >
              <Text
                style={{
                  ...(active ? fonts.bold : fonts.regular),
                  fontSize: 16,
                  color: active ? colors.tint : colors.text.secondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
