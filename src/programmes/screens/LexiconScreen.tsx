import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { useScrollToHash } from '@/src/core/hooks/useScrollToHash';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { GuideParagraph } from '@/src/programmes/components/GuideParagraph';
import { MoreText } from '@/src/programmes/components/MoreText';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { lexiconViewModel } from '@/src/programmes/view-models/contenus-2027.view-model';

/** Lexique : une seule page, un terme par ancre (`#<id>`), la définition visible, le détail replié. */
export default function LexiconScreen() {
  const vm = useViewModel(lexiconViewModel);
  const { colors, effects, fonts } = useTheme();
  useScrollToHash(vm.status === 'loaded');

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Comprendre', href: '/comprendre' }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="title">Lexique de la politique française</Text>
        <Text style={{ fontSize: 17, lineHeight: 26 }}>
          {`${vm.count} mots pour suivre l'actualité politique, du 49.3 au vote blanc. Chaque définition est sourcée.`}
        </Text>
        {vm.verifiedOn ? (
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            {`Vérifié le ${formatLongDate(vm.verifiedOn)}`}
          </Text>
        ) : null}
      </View>

      <View
        role="navigation"
        aria-label="Index alphabétique"
        style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: effects.spacing.sm }}
      >
        {vm.groups.map((group) => (
          <TextLink
            key={group.anchor}
            href={`${CONTENUS_2027_PATHS.lexicon}#${group.anchor}`}
            style={{ ...fonts.bold, fontSize: 17, paddingVertical: 8, paddingHorizontal: 4 }}
          >
            {group.letter}
          </TextLink>
        ))}
      </View>

      {vm.groups.map((group) => (
        <View key={group.anchor} nativeID={group.anchor} style={{ gap: effects.spacing.sm }}>
          <Text
            variant="title"
            headingLevel={2}
            style={{
              fontSize: 24,
              lineHeight: 30,
              paddingBottom: effects.spacing.xs,
              borderBottomWidth: 1,
              borderColor: colors.surface.border.primary,
            }}
          >
            {group.letter}
          </Text>
          {group.items.map(({ entry, lessons }) => (
            <View
              key={entry.id}
              nativeID={entry.id}
              style={{
                gap: effects.spacing.xs,
                padding: effects.spacing.md,
                borderRadius: effects.borderRadius.small,
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
                backgroundColor: colors.surface.primary,
              }}
            >
              <Text variant="display" headingLevel={3}>
                {entry.term}
              </Text>
              <Text style={{ fontSize: 17, lineHeight: 27 }}>{entry.definition}</Text>
              {entry.more.length ? (
                <MoreText>
                  {entry.more.map((paragraph) => (
                    <GuideParagraph key={paragraph} text={paragraph} small />
                  ))}
                </MoreText>
              ) : null}
              {lessons.length ? (
                <View style={{ gap: effects.spacing.xxs }}>
                  <Text variant="caption">Pour aller plus loin</Text>
                  {lessons.map((lesson) => (
                    <TextLink key={lesson.id} href={lesson.href} standalone>
                      {lesson.title}
                    </TextLink>
                  ))}
                </View>
              ) : null}
              <SourceChip sources={entry.sources} subject={entry.term} />
            </View>
          ))}
        </View>
      ))}

      <PageSources sources={vm.allSources} />
    </Page>
  );
}
