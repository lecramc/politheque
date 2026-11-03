import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';
import { themesViewModel } from '@/src/programmes/view-models/theme.view-model';

export default function DebatesScreen() {
  const vm = useViewModel(themesViewModel);
  const { colors, effects, fonts } = useTheme();

  return (
    <Page loading={vm.status !== 'loaded'}>
      <View style={{ gap: 6 }}>
        <Text variant="title">Les grands débats</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
          Pour chaque sujet : les enjeux, les chiffres, ce que proposent les partis.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
        {vm.themes.map((theme) => (
          <Link
            key={theme.id}
            href={{ pathname: '/debats/[id]', params: { id: theme.id } }}
            asChild
          >
            <Pressable
              style={{
                flexGrow: 1,
                flexBasis: 150,
                minHeight: 170,
                gap: 10,
                padding: effects.spacing.md,
                borderRadius: effects.borderRadius.small,
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
                backgroundColor: colors.surface.primary,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.tintSoft,
                }}
              >
                <Icon name={theme.icon} variant="onGlass" size="medium" />
              </View>
              <Text style={{ ...fonts.display, fontSize: 19, lineHeight: 23 }}>{theme.title}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }} numberOfLines={3}>
                {theme.debates[0]?.question}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Page>
  );
}
