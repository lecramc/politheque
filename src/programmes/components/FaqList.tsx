import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { CalculatedDateNote } from '@/src/programmes/components/CalculatedDateNote';
import { GuideParagraph } from '@/src/programmes/components/GuideParagraph';
import { MoreText } from '@/src/programmes/components/MoreText';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { CalculatedNote, LessonLink } from '@/src/programmes/models/contenus-2027';
import type { FaqEntry } from '@/src/programmes/models/programme.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

type FaqItem = { entry: FaqEntry; lessons: LessonLink[]; calculated: CalculatedNote[] };

/**
 * Questions-réponses (section finale de la leçon sur la présidentielle) : la réponse courte est
 * visible, le détail replié, les dates calculées signalées.
 */
export function FaqList({
  anchor,
  items,
  verifiedOn,
}: {
  anchor: string;
  items: FaqItem[];
  verifiedOn: string | null;
}) {
  const { colors, effects } = useTheme();
  return (
    <View nativeID={anchor} style={{ gap: effects.spacing.md }}>
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
          Questions fréquentes
        </Text>
        <Text style={{ fontSize: 17, lineHeight: 26 }}>
          {`${items.length} questions, une réponse courte à chacune, avec ses sources officielles. Les dates déduites d'une règle sont signalées « date calculée ».`}
        </Text>
        {verifiedOn ? (
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            {`Vérifié le ${formatLongDate(verifiedOn)}`}
          </Text>
        ) : null}
      </View>

      {items.map(({ entry, lessons, calculated }) => (
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
          <Text variant="display" headingLevel={3}>
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
    </View>
  );
}
