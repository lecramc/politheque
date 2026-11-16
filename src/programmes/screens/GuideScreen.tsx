import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { useScrollToHash } from '@/src/core/hooks/useScrollToHash';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Page } from '@/src/programmes/components/Page';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { comprendreViewModel } from '@/src/programmes/view-models/comprendre.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';

const metaViewModel = pageMetaViewModel((catalog) => rubricMeta('comprendre', catalog));

/**
 * Comprendre : les leçons en trois chapitres (ancres `#les-bases`, `#les-institutions`,
 * `#presidentielle-2027`, cibles des anciennes adresses du parcours), le suivi de lecture et la suite.
 */
export default function GuideScreen() {
  const vm = useViewModel(comprendreViewModel);
  const meta = useViewModel(metaViewModel);
  const { colors, effects, fonts } = useTheme();
  useScrollToHash(vm.status === 'loaded');

  const row = (
    item: { key: string; title: string; href: string; read?: boolean; meta?: string | null },
    index: number
  ) => (
    <Link key={item.key} href={item.href as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        accessibilityLabel={`${item.title}${item.meta ? `, ${item.meta}` : ''}${item.read ? ', lu' : ''}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.xs,
          minHeight: 52,
          paddingHorizontal: effects.spacing.md,
          paddingVertical: 10,
          borderTopWidth: index === 0 ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        <View style={{ width: 22, alignItems: 'center' }}>
          {item.read ? <Icon name="checkmark" variant="onGlass" size="small" /> : null}
        </View>
        <Text style={{ flex: 1, fontSize: 16 }}>{item.title}</Text>
        {item.meta ? (
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{item.meta}</Text>
        ) : (
          <Icon name="chevron-forward" variant="secondary" size="small" />
        )}
      </Pressable>
    </Link>
  );

  const box = { gap: 0 };
  const card = {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border.primary,
    borderRadius: effects.borderRadius.small,
    overflow: 'hidden' as const,
  };

  return (
    <Page meta={meta} loading={vm.status !== 'loaded'} template="hub">
      {/* Pleine largeur du conteneur (comme /partis) : trois chapitres de 357 px chacun dès 1024 px,
          au lieu de trois colonnes de 235 px dans une colonne de 768 px. */}
      <View style={{ gap: effects.spacing.lg }}>
        <View style={{ gap: 6 }}>
          <Text variant="title">Comprendre</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
            {`${vm.reading.total} leçons courtes, à lire dans l'ordre ou au choix.`}
          </Text>
        </View>

        <View style={[card, { padding: effects.spacing.md, gap: effects.spacing.xs }]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: effects.spacing.sm }}>
            <Text style={{ ...fonts.displayBold, fontSize: 18, flex: 1 }}>Votre lecture</Text>
            <Text plainDigits style={{ color: colors.text.secondary, fontSize: 15 }}>
              {vm.reading.label}
            </Text>
            <TextLink href={vm.progressHref}>Ma progression</TextLink>
          </View>
          <View
            role="progressbar"
            aria-label={`Leçons lues : ${vm.reading.label}`}
            aria-valuemin={0}
            aria-valuemax={vm.reading.total}
            aria-valuenow={vm.reading.readCount}
            style={{ flexDirection: 'row', gap: 4 }}
          >
            {Array.from({ length: vm.reading.total }, (_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: effects.borderRadius.round,
                  backgroundColor:
                    i < vm.reading.readCount ? colors.tint : colors.surface.border.primary,
                }}
              />
            ))}
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            Reste sur cet appareil. Rien n'est envoyé.
          </Text>
        </View>

        {/* Chapitres : une colonne sous 768 px, 2 puis 3 colonnes ensuite (CSS). */}
        <View {...tv('grid-3')} style={{ gap: effects.spacing.lg }}>
          {vm.chapters.map((chapter) => (
            <View
              key={chapter.id}
              nativeID={chapter.id}
              style={{ gap: effects.spacing.xs, minWidth: 0 }}
            >
              <Text variant="caption" headingLevel={2}>
                {`${chapter.number} · ${chapter.title}`}
              </Text>
              <View style={[card, box]}>
                {chapter.items.map((item, index) =>
                  row(
                    {
                      key: item.key,
                      title: item.title,
                      href: item.href,
                      read: item.read,
                      meta: item.minutes ? `${item.minutes} min` : null,
                    },
                    index
                  )
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="caption" headingLevel={2}>
            Ensuite
          </Text>
          <View style={[card, box]}>
            {vm.then.map((item, index) =>
              row({ key: item.id, title: item.title, href: item.href, meta: item.meta }, index)
            )}
          </View>
        </View>

        {/* Les votes de l'Assemblée : hors parcours (aucune progression, aucune opinion mesurée). */}
        <Link href={vm.assemblee.href as never} asChild>
          <Pressable
            large
            accessibilityRole="link"
            style={{
              ...card,
              gap: 4,
              padding: effects.spacing.md,
            }}
          >
            <Text style={{ ...fonts.displayBold, fontSize: 18 }}>{vm.assemblee.title}</Text>
            <Text style={{ color: colors.text.secondary, fontSize: 15, lineHeight: 22 }}>
              {vm.assemblee.text}
            </Text>
            {vm.assemblee.meta ? (
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                {vm.assemblee.meta}
              </Text>
            ) : null}
          </Pressable>
        </Link>

        <TextLink href={vm.lexicon.href} standalone>
          {vm.lexicon.label}
        </TextLink>
      </View>
    </Page>
  );
}
