import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { PageSources } from '@/src/programmes/components/PageSources';
import { ReadingGuide } from '@/src/programmes/components/ReadingGuide';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { StanceLegend } from '@/src/programmes/components/StanceLegend';
import { StanceColumnHead } from '@/src/programmes/components/StanceRow';
import { TabPanel } from '@/src/programmes/components/Tabs';
import {
  GUIDE_ANCHORS,
  positionsGuideParagraphs,
} from '@/src/programmes/models/reading-guides.copy';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « Positions » : /partis/[id]/positions. */
export default function PartyPositionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const { markRead } = vm;
  const found = !!vm.party;

  // Ouvrir « Positions » vaut lecture de la fiche (règle du parcours citoyen).
  useEffect(() => {
    if (found) markRead();
  }, [found, markRead]);

  if (!vm.party) return null;
  const meta = vm.metaBySection?.['positions'];

  return (
    <TabPanel id="positions" style={{ gap: effects.spacing.lg }}>
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.xs }}>
        <SectionTitle>Positions sur {vm.stances.length} questions</SectionTitle>
      </View>
      <StanceLegend />
      <ReadingGuide anchor={GUIDE_ANCHORS.positions}>
        {positionsGuideParagraphs(vm.stances.length, vm.partyCount).map((paragraph) => (
          <Text key={paragraph} style={{ fontSize: 16, lineHeight: 25 }}>
            {paragraph}
          </Text>
        ))}
      </ReadingGuide>
      <View style={{ gap: effects.spacing.md }}>
        <StanceColumnHead
          left="Affirmation"
          right="Position"
          paddingHorizontal={effects.spacing.md + 1}
          gap={12}
          endInset={effects.sizes.icon.small}
        />
        {vm.stancesByTheme.map((group) => (
          <View key={group.theme.id} style={{ gap: effects.spacing.xs }}>
            {/* Intertitre de thème à toutes les largeurs : même ordre pour les dix partis. */}
            <Text
              accessibilityRole="header"
              aria-level={2}
              style={{
                ...fonts.bold,
                fontSize: 15,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: colors.text.secondary,
              }}
            >
              {group.theme.title}
            </Text>
            <TextLink href={`/debats/${group.theme.id}`} standalone>
              {`Le grand débat : ${group.theme.title}`}
            </TextLink>
            {group.items.map(({ question, stance }) => (
              <Accordion
                key={question.id}
                title={question.statement}
                titleWeight="regular"
                stance={<StanceBadge stance={stance?.stance ?? null} />}
                leading={null}
                subtitle={undefined}
              >
                <Text style={{ fontSize: 16, lineHeight: 24 }}>{stance?.justification}</Text>
                {stance?.sources.length ? <SourceChip sources={stance.sources} /> : null}
              </Accordion>
            ))}
          </View>
        ))}
      </View>
      <PageSources
        sources={vm.sourcesBySection['positions']}
        verifiedOn={vm.verifiedOn}
        updatedOn={vm.updatedOn}
      />
    </TabPanel>
  );
}
