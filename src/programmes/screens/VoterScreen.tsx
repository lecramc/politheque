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
import { voterViewModel } from '@/src/programmes/view-models/contenus-2027.view-model';

/** Comment voter en 2027 : une section par étape (h2), le détail replié, les sources à chaque étape. */
export default function VoterScreen() {
  const vm = useViewModel(voterViewModel);
  const { colors, effects } = useTheme();
  const voter = vm.voter;

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Présidentielle 2027', href: vm.electionHref }}
    >
      {voter ? (
        <>
          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="title">{voter.title}</Text>
            <View
              style={{
                backgroundColor: colors.tintSoft,
                borderRadius: effects.borderRadius.small,
                padding: effects.spacing.md,
              }}
            >
              <Text style={{ fontSize: 17, lineHeight: 26 }}>{voter.summary}</Text>
            </View>
            <SourceChip sources={voter.summarySources} subject={voter.title} />
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              {`Vérifié le ${formatLongDate(voter.lastVerified)}`}
            </Text>
          </View>

          {vm.sections.map(({ section, calculated }) => (
            <View
              key={section.id}
              nativeID={section.id}
              style={{
                gap: effects.spacing.xs,
                paddingTop: effects.spacing.md,
                borderTopWidth: 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
                {section.title}
              </Text>
              {section.paragraphs.map((paragraph) => (
                <GuideParagraph key={paragraph} text={paragraph} />
              ))}
              {calculated.map((note) => (
                <CalculatedDateNote key={note.label} note={note} />
              ))}
              {section.more?.length ? (
                <MoreText>
                  {section.more.map((paragraph) => (
                    <GuideParagraph key={paragraph} text={paragraph} small />
                  ))}
                </MoreText>
              ) : null}
              <SourceChip sources={section.sources} subject={section.title} />
            </View>
          ))}

          <View style={{ gap: effects.spacing.xxs }}>
            <Text variant="caption">Pour aller plus loin</Text>
            <TextLink href={vm.faqHref} standalone>
              Les questions fréquentes sur la présidentielle 2027
            </TextLink>
            {vm.lesson ? (
              <TextLink href={vm.lesson.href} standalone>
                {`La leçon « ${vm.lesson.title} »`}
              </TextLink>
            ) : null}
            <TextLink href={vm.electionHref} standalone>
              Dates et candidatures de l'élection
            </TextLink>
          </View>

          <PageSources sources={vm.allSources} />
        </>
      ) : null}
    </Page>
  );
}
