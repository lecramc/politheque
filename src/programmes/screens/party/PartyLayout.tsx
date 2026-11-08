import { Slot, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';
import { PartyHeader } from '@/src/programmes/components/PartyHeader';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { Tabs } from '@/src/programmes/components/Tabs';
import { splitIdeals } from '@/src/programmes/models/ideals.service';
import { partyHref, sectionFromPath } from '@/src/programmes/models/seo/party-sections';
import { bodyText } from '@/src/programmes/models/sourced-item.service';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * Fiche parti : en-tête, quatre onglets-liens (Programme, Positions, Histoire, Procédures) et feuille partagée ; le contenu de chaque section
 * est une vraie route (`<Slot />`), qui rend ses propres métadonnées.
 */
export default function PartyLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects } = useTheme();
  const [familyOpen, setFamilyOpen] = useState(false);
  const party = vm.party;
  // Compteurs de la liste verticale : seule « Positions » en a un (le nombre de questions).
  const tabsWithCounts = vm.sections.map((s) =>
    s.id === 'positions' ? { ...s, count: String(vm.stances.length) } : s
  );
  const section = sectionFromPath(pathname) ?? 'programme';

  if (vm.status === 'loaded' && !party) {
    return (
      <Page meta={vm.notFoundMeta} back={{ label: 'Partis', href: '/partis' }}>
        <Text variant="title">Parti introuvable</Text>
      </Page>
    );
  }

  return (
    <Page
      meta={null}
      article
      breadcrumb={vm.metaBySection?.[section]?.breadcrumb}
      loading={vm.status !== 'loaded'}
      back={{ label: 'Partis', href: '/partis' }}
      onReachEnd={vm.markRead}
      railOnMobile="stack"
      rail={
        party ? (
          <>
            <PartyHeader
              party={party}
              identityLine={vm.identityLine}
              compareHref={`/partis/comparer?a=${party.id}`}
              onOpenFamily={() => setFamilyOpen(true)}
            />
            {/* Même navigation, deux présentations : liste verticale dès 1024 px, onglets sinon. */}
            <Only from="lg">
              <Tabs
                tabs={tabsWithCounts}
                value={section}
                hrefOf={(sectionId) => partyHref(party.id, sectionId)}
                navLabel="Sections de la fiche"
                vertical
              />
            </Only>
            <Only below="lg">
              <Tabs
                tabs={vm.sections}
                value={section}
                hrefOf={(sectionId) => partyHref(party.id, sectionId)}
                navLabel="Sections de la fiche"
                wrap
              />
            </Only>
          </>
        ) : undefined
      }
    >
      {party ? (
        <>
          <Slot />

          <Sheet isOpen={familyOpen} onClose={() => setFamilyOpen(false)} title="Famille politique">
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.family}</Text>
            {splitIdeals(party.history?.ideals ?? []).classification.map((item) => (
              <View key={item.title} style={{ gap: effects.spacing.xs }}>
                <Text style={{ fontSize: 16, lineHeight: 25 }}>{bodyText(item)}</Text>
                <SourceChip sources={item.sources} subject={item.title} />
              </View>
            ))}
            <Text style={{ color: colors.text.secondary }}>
              Les étiquettes viennent de la presse de référence, des politistes et du ministère de
              l'Intérieur ; chaque parti peut les contester. Le même traitement s'applique à tous.
            </Text>
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
