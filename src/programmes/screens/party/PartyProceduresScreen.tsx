import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { LegalEntryCard } from '@/src/programmes/components/legal/LegalEntryCard';
import { ProceduresEmpty } from '@/src/programmes/components/legal/ProceduresEmpty';
import { ProceduresIntro } from '@/src/programmes/components/legal/ProceduresIntro';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « Procédures judiciaires » : /partis/[id]/procedures-judiciaires (même gabarit pour les dix partis). */
export default function PartyProceduresScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { effects } = useTheme();
  const dossier = vm.procedures;
  if (!dossier) return null;
  const meta = vm.metaBySection?.['procedures'];
  const groups = [
    { title: 'Procédures en cours', entries: dossier.ongoing },
    { title: 'Procédures terminées', entries: dossier.closed },
  ].filter((group) => group.entries.length > 0);

  return (
    <TabPanel id="procedures">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.md }}>
        <ProceduresIntro reviewedOn={dossier.reviewedOn} />
        {dossier.isEmpty ? <ProceduresEmpty reviewedOn={dossier.reviewedOn} /> : null}
        {groups.map((group) => (
          <View key={group.title} style={{ gap: effects.spacing.sm }}>
            <SectionTitle>{group.title}</SectionTitle>
            {group.entries.map((entry) => (
              <LegalEntryCard key={entry.id} entry={entry} />
            ))}
          </View>
        ))}
      </View>
      <PageSources sources={vm.sourcesBySection['procedures']} verifiedOn={vm.verifiedOn} />
    </TabPanel>
  );
}
