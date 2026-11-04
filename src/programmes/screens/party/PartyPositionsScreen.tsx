import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « Positions » : /partis/[id]/positions. */
export default function PartyPositionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects } = useTheme();
  const { markRead } = vm;
  const found = !!vm.party;

  // Ouvrir « Positions » vaut lecture de la fiche (règle du parcours citoyen).
  useEffect(() => {
    if (found) markRead();
  }, [found, markRead]);

  if (!vm.party) return null;
  const meta = vm.metaBySection?.['positions'];

  return (
    <TabPanel id="positions">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="caption" headingLevel={2}>
          Positions sur {vm.stances.length} questions
        </Text>
        <Text style={{ color: colors.text.secondary }}>
          Ce que le parti défend sur les {vm.stances.length} affirmations du questionnaire, d'après
          ses programmes, ses votes et ses déclarations.
        </Text>
        {vm.stances.map(({ question, stance }) => (
          <Accordion
            key={question.id}
            title={question.statement}
            trailing={null}
            leading={null}
            subtitle={undefined}
          >
            <StanceBadge stance={stance?.stance ?? null} />
            <Text style={{ fontSize: 16, lineHeight: 24 }}>{stance?.justification}</Text>
            {stance?.sources.length ? <SourceChip sources={stance.sources} /> : null}
          </Accordion>
        ))}
      </View>
      <PageSources sources={vm.sourcesBySection['positions']} />
    </TabPanel>
  );
}
