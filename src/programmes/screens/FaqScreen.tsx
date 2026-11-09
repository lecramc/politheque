import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { CalculatedDateNote } from '@/src/programmes/components/CalculatedDateNote';
import { GuideParagraph } from '@/src/programmes/components/GuideParagraph';
import { MoreText } from '@/src/programmes/components/MoreText';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { faqViewModel } from '@/src/programmes/view-models/contenus-2027.view-model';

/** Questions-réponses : la réponse courte est visible, le détail replié, les dates calculées signalées. */
export default function FaqScreen() {
  const vm = useViewModel(faqViewModel);
  const { colors, effects } = useTheme();

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Présidentielle 2027', href: vm.electionHref }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="title">{`Présidentielle 2027 : ${vm.items.length} questions-réponses`}</Text>
        <Text style={{ fontSize: 17, lineHeight: 26 }}>
          Une réponse courte à chaque question, avec ses sources officielles. Les dates déduites
          d'une règle sont signalées « date calculée ».
        </Text>
        {vm.verifiedOn ? (
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            {`Vérifié le ${formatLongDate(vm.verifiedOn)}`}
          </Text>
        ) : null}
        <TextLink href={vm.voterHref} standalone>
          Comment voter : le guide détaillé
        </TextLink>
      </View>

      {vm.items.map(({ entry, lessons, calculated }) => (
        <View
          key={entry.id}
          nativeID={entry.id}
          style={{
            gap: effects.spacing.xs,
            paddingTop: effects.spacing.md,
            borderTopWidth: 1,
            borderColor: colors.surface.border.primary,
          }}
        >
          <Text variant="display" headingLevel={2}>
            {entry.question}
          </Text>
          <Text style={{ fontSize: 17, lineHeight: 27 }}>{entry.answer}</Text>
          {calculated.map((note) => (
            <CalculatedDateNote key={note.label} note={note} />
          ))}
          {entry.more?.length ? (
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
          <SourceChip sources={entry.sources} subject={entry.question} />
        </View>
      ))}

      <PageSources sources={vm.allSources} />
    </Page>
  );
}
