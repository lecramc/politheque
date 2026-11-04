import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { TabPanel } from '@/src/programmes/components/Tabs';
import {
  afterFirstSentence,
  firstSentence,
  formatSourceDate,
} from '@/src/programmes/models/presentation.service';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « Histoire » : /partis/[id]/histoire. */
export default function PartyHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const history = vm.party?.history;
  if (!history) return null;
  const meta = vm.metaBySection?.['histoire'];

  return (
    <TabPanel id="histoire">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.md }}>
        {history.whyCreated ? (
          <Card style={{ backgroundColor: colors.tintSoft, borderColor: colors.tintBorder }}>
            <Text variant="caption" headingLevel={2}>
              Pourquoi ce parti a été créé
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{history.whyCreated.text}</Text>
            <SourceChip sources={history.whyCreated.sources} />
          </Card>
        ) : (
          <Card>
            <Text variant="caption" headingLevel={2}>
              Origines
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{history.origins.text}</Text>
            <SourceChip sources={history.origins.sources} />
          </Card>
        )}

        {history.figures?.length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              Fondateurs et figures
            </Text>
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
          <Text variant="caption" headingLevel={2}>
            Repères
          </Text>
          <View
            style={{
              borderLeftWidth: 2,
              borderColor: colors.tintBorder,
              marginLeft: 6,
              gap: 14,
              paddingVertical: 4,
            }}
          >
            {history.timeline.map((item) => (
              <View key={item.date + item.event} style={{ paddingLeft: 16, gap: 4 }}>
                <View
                  style={{
                    position: 'absolute',
                    left: -7,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
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

        {(history.thought ?? history.ideals).length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              {history.thought ? 'Courants de pensée' : 'Idées et classement'}
            </Text>
            {(history.thought ?? history.ideals).map((item) => (
              <Accordion key={item.text} title={firstSentence(item.text)}>
                {afterFirstSentence(item.text) ? (
                  <Text style={{ fontSize: 16, lineHeight: 25 }}>
                    {afterFirstSentence(item.text)}
                  </Text>
                ) : null}
                <SourceChip sources={item.sources} />
              </Accordion>
            ))}
          </View>
        ) : null}
      </View>
      <PageSources sources={vm.sourcesBySection['histoire']} />
    </TabPanel>
  );
}
