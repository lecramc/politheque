import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { MoreText } from '@/src/programmes/components/MoreText';
import { PageSources } from '@/src/programmes/components/PageSources';
import { ReadingGuide } from '@/src/programmes/components/ReadingGuide';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { SourcedAccordionList } from '@/src/programmes/components/SourcedAccordionList';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { splitIdeals } from '@/src/programmes/models/ideals.service';
import { foldAfterSentences, formatSourceDate } from '@/src/programmes/models/presentation.service';
import {
  CLASSIFICATION_GUIDE_TEXT,
  GUIDE_ANCHORS,
} from '@/src/programmes/models/reading-guides.copy';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * Règle de repli mécanique, la même pour les dix partis : les deux premières phrases, puis
 * « Lire la suite ». Le texte du parti n'est jamais réécrit.
 */
function FoldedText({ text }: { text: string }) {
  const { visible, rest } = foldAfterSentences(text, 2);
  return (
    <>
      <Text style={{ fontSize: 16, lineHeight: 25 }}>{visible}</Text>
      {rest ? (
        <MoreText label="Lire la suite">
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{rest}</Text>
        </MoreText>
      ) : null}
    </>
  );
}

/** « Histoire » : /partis/[id]/histoire. */
export default function PartyHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const history = vm.party?.history;
  if (!history) return null;
  const meta = vm.metaBySection?.['histoire'];
  const { classification, others } = splitIdeals(history.ideals);

  return (
    <TabPanel id="histoire">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.md }}>
        <View style={{ gap: effects.spacing.xs }}>
          <SectionTitle>Le parti aujourd'hui</SectionTitle>
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.party?.description}</Text>
        </View>

        {others.length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <SectionTitle>Comment il se définit</SectionTitle>
            <SourcedAccordionList items={others} />
          </View>
        ) : null}

        <View style={{ gap: effects.spacing.xs }}>
          <SectionTitle>Comment on le classe</SectionTitle>
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.party?.family}</Text>
          <SourcedAccordionList items={classification} />
          <ReadingGuide anchor={GUIDE_ANCHORS.classification}>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{CLASSIFICATION_GUIDE_TEXT}</Text>
          </ReadingGuide>
        </View>

        {history.whyCreated ? (
          <Card style={{ backgroundColor: colors.tintSoft, borderColor: colors.tintBorder }}>
            <SectionTitle>Pourquoi ce parti a été créé</SectionTitle>
            <FoldedText text={history.whyCreated.text} />
            <SourceChip sources={history.whyCreated.sources} />
          </Card>
        ) : (
          <Card>
            <SectionTitle>Origines</SectionTitle>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{history.origins.text}</Text>
            <SourceChip sources={history.origins.sources} />
          </Card>
        )}

        {history.figures?.length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <SectionTitle>Fondateurs et figures</SectionTitle>
            {history.figures.map((figure) => (
              <Accordion key={figure.name} title={figure.name} subtitle={figure.role}>
                <Text style={{ color: colors.text.secondary }}>{figure.role}</Text>
                <Text style={{ fontSize: 16, lineHeight: 25 }}>{figure.background}</Text>
                <SourceChip sources={figure.sources} subject={figure.name} />
              </Accordion>
            ))}
          </View>
        ) : null}

        <View style={{ gap: effects.spacing.xs }}>
          <SectionTitle>Repères</SectionTitle>
          <View
            style={{
              borderLeftWidth: 2,
              borderColor: colors.tintBorder,
              marginLeft: 6,
              gap: effects.spacing.smd,
              paddingVertical: 4,
            }}
          >
            {history.timeline.map((item) => (
              <View
                key={item.date + item.event}
                style={{ paddingLeft: 16, gap: effects.spacing.xxs }}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: -7,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: effects.borderRadius.round,
                    borderWidth: 2,
                    borderColor: colors.tint,
                    backgroundColor: colors.background.secondary,
                  }}
                />
                <Text style={{ ...fonts.bold, color: colors.tint }}>
                  {formatSourceDate(item.date)}
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.event}</Text>
                <SourceChip sources={item.sources} />
              </View>
            ))}
          </View>
        </View>

        {history.thought?.length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <SectionTitle>Courants de pensée</SectionTitle>
            <SourcedAccordionList items={history.thought} />
          </View>
        ) : null}
      </View>
      <PageSources
        sources={vm.sourcesBySection['histoire']}
        verifiedOn={vm.verifiedOn}
        updatedOn={vm.updatedOn}
      />
    </TabPanel>
  );
}
