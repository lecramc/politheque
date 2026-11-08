import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Page } from '@/src/programmes/components/Page';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';
import { themesViewModel } from '@/src/programmes/view-models/theme.view-model';

const metaViewModel = pageMetaViewModel((catalog) => rubricMeta('debats', catalog));

export default function DebatesScreen() {
  const vm = useViewModel(themesViewModel);
  const meta = useViewModel(metaViewModel);
  const { colors, effects, fonts } = useTheme();

  return (
    <Page meta={meta} loading={vm.status !== 'loaded'} template="hub">
      <View {...tv('list-col')} style={{ gap: 6 }}>
        <Text variant="title">Les grands débats</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
          Pour chaque sujet : les enjeux, les chiffres, ce que proposent les partis.
        </Text>
      </View>
      {/* Mobile : 2 colonnes qui passent à la ligne. Dès 768 px : grille de 2 puis 3 colonnes (CSS),
          jamais de carte orpheline étirée. */}
      <View
        {...tv('grid-3')}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}
      >
        {vm.themes.map((theme) => (
          <Link
            key={theme.id}
            href={{ pathname: '/debats/[id]', params: { id: theme.id } }}
            asChild
          >
            <Pressable
              large
              style={{
                flexGrow: 1,
                flexBasis: 150,
                minHeight: 170,
                gap: effects.spacing.sm,
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
