import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Arc } from '@/src/programmes/components/Arc';
import { Page } from '@/src/programmes/components/Page';
import { guideViewModel } from '@/src/programmes/view-models/guide.view-model';

export default function GuideScreen() {
  const vm = useViewModel(guideViewModel);
  const { colors, effects, fonts } = useTheme();

  return (
    <Page loading={vm.status !== 'loaded'}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: effects.spacing.sm }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="title">Comprendre la politique</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
            {vm.total} leçons courtes, à lire dans l'ordre ou au choix.
          </Text>
        </View>
        <Arc
          value={vm.total ? vm.readCount / vm.total : 0}
          size={72}
          strokeWidth={8}
          accessibilityLabel={`${vm.readCount} leçons lues sur ${vm.total}`}
        >
          <Text style={{ ...fonts.displayBold, fontSize: 17, color: colors.tint }}>
            {vm.readCount}/{vm.total}
          </Text>
        </Arc>
      </View>

      {vm.next ? (
        <Link href={{ pathname: '/comprendre/[id]', params: { id: vm.next.id } }} asChild>
          <Pressable
            large
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: effects.spacing.md,
              borderRadius: effects.borderRadius.small,
              backgroundColor: colors.tintSoft,
            }}
          >
            <Text style={{ ...fonts.bold, color: colors.tint, flex: 1, fontSize: 16 }}>
              Reprendre : {vm.next.title}
            </Text>
            <Icon name="chevron-forward" variant="onGlass" size="small" />
          </Pressable>
        </Link>
      ) : null}

      {vm.groups.map((group) => (
        <View key={group.id} style={{ gap: effects.spacing.xs }}>
          <Text variant="caption">{group.title}</Text>
          <View
            style={{
              backgroundColor: colors.surface.primary,
              borderWidth: 1,
              borderColor: colors.surface.border.primary,
              borderRadius: effects.borderRadius.small,
            }}
          >
            {group.rows.map(({ section, minutes, read }, index) => (
              <Link
                key={section.id}
                href={{ pathname: '/comprendre/[id]', params: { id: section.id } }}
                asChild
              >
                <Pressable
                  large
                  accessibilityLabel={`${section.title}, ${minutes} minutes${read ? ', lu' : ''}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    minHeight: 64,
                    paddingHorizontal: effects.spacing.md,
                    paddingVertical: 12,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderColor: colors.surface.border.primary,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: read ? colors.tint : colors.tintSoft,
                    }}
                  >
                    {read ? (
                      <Icon name="checkmark" variant="onColor" size="medium" />
                    ) : (
                      <Icon name={section.icon} variant="onGlass" size="small" />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ ...fonts.bold, fontSize: 16 }}>{section.title}</Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                      {minutes} min{read ? ' · lu' : ''}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" variant="secondary" size="small" />
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ))}
    </Page>
  );
}
