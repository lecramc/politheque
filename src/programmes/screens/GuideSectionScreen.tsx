import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import {
  guideSectionViewModel,
  guideViewModel,
} from '@/src/programmes/view-models/guide.view-model';

export default function GuideSectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(guideSectionViewModel(id));
  const guide = useViewModel(guideViewModel);
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
      railOnMobile="hidden"
      rail={
        section ? (
          <>
            <View
              role="navigation"
              aria-label="Sommaire du guide"
              style={{ gap: effects.spacing.sm }}
            >
              {guide.groups.map((group) => (
                <View key={group.id} style={{ gap: effects.spacing.xxs }}>
                  <Text variant="caption">{group.title}</Text>
                  {group.rows.map(({ section: item }) => {
                    const current = item.id === section.id;
                    return (
                      <Link
                        key={item.id}
                        href={{ pathname: '/comprendre/[id]', params: { id: item.id } }}
                        asChild
                      >
                        <Pressable
                          accessibilityRole="link"
                          aria-current={current ? 'page' : undefined}
                          hoverStyle={{ backgroundColor: colors.surface.hover }}
                          style={{
                            minHeight: 40,
                            justifyContent: 'center',
                            paddingHorizontal: effects.spacing.sm,
                            borderRadius: effects.borderRadius.xs,
                            backgroundColor: current ? colors.tintSoft : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              ...(current ? fonts.bold : fonts.regular),
                              fontSize: 15,
                              color: current ? colors.tint : colors.text.primary,
                            }}
                          >
                            {item.title}
                          </Text>
                        </Pressable>
                      </Link>
                    );
                  })}
                </View>
              ))}
            </View>
            {vm.next ? (
              <Button variant="secondary" href={`/comprendre/${vm.next.id}`} onPress={vm.markRead}>
                {`Section suivante : ${vm.next.title}`}
              </Button>
            ) : null}
          </>
        ) : undefined
      }
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
            <Only below="lg" style={{ gap: effects.spacing.xs }}>
              <Text variant="caption">À suivre</Text>
              <Text style={{ fontSize: effects.sizes.text.body, lineHeight: 24 }}>
                {vm.next.title}
              </Text>
              <Button variant="brand" href={`/comprendre/${vm.next.id}`} onPress={vm.markRead}>
                Section suivante
              </Button>
            </Only>
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
