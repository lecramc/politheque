import { Slot, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useState } from 'react';

import { Text } from '@/components/Themed';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';
import { PartyHeader } from '@/src/programmes/components/PartyHeader';
import { PartyLabelsDetail } from '@/src/programmes/components/PartyLabelsDetail';
import { Sheet } from '@/src/programmes/components/Sheet';
import { Tabs } from '@/src/programmes/components/Tabs';
import { partyHref, sectionFromPath } from '@/src/programmes/models/seo/party-sections';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * Fiche parti : en-tête, quatre onglets-liens (Programme, Positions, Histoire, Procédures) et feuille partagée ; le contenu de chaque section
 * est une vraie route (`<Slot />`), qui rend ses propres métadonnées.
 */
export default function PartyLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const vm = useViewModel(partyViewModel(id));
  const [labelsOpen, setLabelsOpen] = useState(false);
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
              labels={vm.labels.lines}
              identityLine={vm.identityLine}
              compareHref={`/partis/comparer?a=${party.id}`}
              onOpenLabels={() => setLabelsOpen(true)}
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

          <Sheet isOpen={labelsOpen} onClose={() => setLabelsOpen(false)} title="Étiquettes">
            <PartyLabelsDetail detail={vm.labels.detail} onNavigate={() => setLabelsOpen(false)} />
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
