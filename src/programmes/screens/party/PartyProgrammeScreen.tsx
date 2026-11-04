import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { firstSentence } from '@/src/programmes/models/presentation.service';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « Pour 2027 » : /partis/[id]/programme-2027. */
export default function PartyProgrammeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects } = useTheme();
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const presidential = vm.presidential;
  if (!vm.party || !presidential) return null;
  const meta = vm.metaBySection?.['programme-2027'];
  const { candidacy } = presidential;

  return (
    <TabPanel id="programme-2027">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.xs }}>
        <View
          style={{
            backgroundColor: colors.tintSoft,
            borderRadius: effects.borderRadius.small,
            padding: effects.spacing.md,
            gap: effects.spacing.xs,
          }}
        >
          <SectionTitle>Candidature et programme 2027</SectionTitle>
          <StatusChip label={candidacy.statusLabel} />
          <Text style={{ fontSize: 15 }}>{candidacy.candidate}</Text>
          <Text style={{ fontSize: 15 }}>{firstSentence(candidacy.programmeStatus)}</Text>
        </View>
        {presidential.sections.map(({ theme, programme }) =>
          programme ? (
            <Accordion
              key={theme.id}
              title={theme.title}
              subtitle={firstSentence(programme.summary)}
              leading={<Icon name={theme.icon} variant="onGlass" size="small" />}
              open={openTheme === theme.id}
              onToggle={(o) => setOpenTheme(o ? theme.id : null)}
            >
              <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
                {programme.summary}
              </Text>
              {programme.measures.map((measure) => (
                <View
                  key={measure.text}
                  style={{
                    gap: 6,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderColor: colors.surface.border.primary,
                  }}
                >
                  <Text style={{ fontSize: 16, lineHeight: 24 }}>{measure.text}</Text>
                  <SourceChip sources={measure.sources} subject={measure.text} />
                </View>
              ))}
            </Accordion>
          ) : null
        )}
      </View>
      <PageSources
        sources={vm.sourcesBySection['programme-2027']}
        verifiedOn={vm.verifiedOn}
        updatedOn={vm.updatedOn}
      />
    </TabPanel>
  );
}
