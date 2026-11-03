import React, { ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import BottomSheet from '@/components/ui/BottomSheet';
import { Pressable } from '@/components/ui/Pressable';

/** Feuille qui monte du bas : titre, contenu défilant, bouton Fermer. */
export function Sheet({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { colors, effects, fonts } = useTheme();
  const { height } = useWindowDimensions();
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: effects.spacing.md,
            paddingVertical: effects.spacing.sm,
            gap: 12,
          }}
        >
          <Text style={{ ...fonts.display, fontSize: 20, flex: 1, color: colors.text.strong }}>
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: colors.tint, ...fonts.bold }}>Fermer</Text>
          </Pressable>
        </View>
        <ScrollView
          style={{ maxHeight: height * 0.7 }}
          contentContainerStyle={{
            paddingHorizontal: effects.spacing.md,
            paddingBottom: effects.spacing.lg,
            gap: effects.spacing.sm,
          }}
        >
          {children}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
