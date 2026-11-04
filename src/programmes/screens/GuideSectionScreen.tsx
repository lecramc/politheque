import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { guideSectionViewModel } from '@/src/programmes/view-models/guide.view-model';

export default function GuideSectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(guideSectionViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const [openIndex, setOpenIndex] = useState(0);
  const section = vm.section;

  if (vm.status === 'loaded' && !section) {
    return (
      <Page meta={vm.notFoundMeta} back={{ label: 'Comprendre', href: '/comprendre' }}>
        <Text variant="title">Section introuvable</Text>
      </Page>
    );
  }

  const open = (index: number) => {
    setOpenIndex(index === openIndex ? -1 : index);
    // La leçon est « lue » quand le dernier bloc a été ouvert.
    if (index === vm.blocks.length - 1) vm.markRead();
  };

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Comprendre', href: '/comprendre' }}
    >
      {section ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text.secondary }}>
              {vm.minutes} min · {vm.blocks.length} parties
            </Text>
            <Text variant="title">{section.title}</Text>
          </View>

          <View
            style={{
              backgroundColor: colors.tintSoft,
              borderRadius: effects.borderRadius.small,
              padding: effects.spacing.md,
            }}
          >
            <Text style={{ fontSize: 17, lineHeight: 26 }}>
              <Text style={{ ...fonts.bold, fontSize: 17 }}>En 20 secondes. </Text>
              {section.summary}
            </Text>
          </View>

          <View style={{ gap: effects.spacing.sm }}>
            {vm.blocks.map(({ block, keyPoint }, index) => (
              <Accordion
                key={block.heading}
                headingLevel={2}
                title={block.heading}
                subtitle={keyPoint}
                open={openIndex === index}
                onToggle={() => open(index)}
              >
                {block.paragraphs.map((paragraph) => (
                  <Text key={paragraph} style={{ fontSize: 17, lineHeight: 27 }}>
                    {paragraph}
                  </Text>
                ))}
                <SourceChip sources={block.sources} subject={block.heading} />
              </Accordion>
            ))}
          </View>

          {vm.next ? (
            <View style={{ gap: effects.spacing.xs }}>
              <Text variant="caption">À suivre</Text>
              <Text style={{ fontSize: effects.sizes.text.body, lineHeight: 24 }}>
                {vm.next.title}
              </Text>
              <Button variant="brand" href={`/comprendre/${vm.next.id}`} onPress={vm.markRead}>
                Section suivante
              </Button>
            </View>
          ) : (
            <Link href="/comprendre">
              <Text style={{ color: colors.tint, ...fonts.bold }}>Retour au sommaire →</Text>
            </Link>
          )}

          <PageSources sources={vm.allSources} />
        </>
      ) : null}
    </Page>
  );
}
