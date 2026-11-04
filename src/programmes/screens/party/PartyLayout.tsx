import { Slot, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useState } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';
import { PartyHeader } from '@/src/programmes/components/PartyHeader';
import { Sheet } from '@/src/programmes/components/Sheet';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { Tabs } from '@/src/programmes/components/Tabs';
import { partyHref, sectionFromPath } from '@/src/programmes/models/seo/party-sections';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * Fiche parti : en-tête, onglets-liens et feuilles partagés ; le contenu de chaque section
 * est une vraie route (`<Slot />`), qui rend ses propres métadonnées.
 */
export default function PartyLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const vm = useViewModel(partyViewModel(id));
  const { colors } = useTheme();
  const [sheet, setSheet] = useState<'famille' | 'candidat' | null>(null);
  const party = vm.party;
  const presidential = vm.presidential;
  const section = sectionFromPath(pathname) ?? 'en-bref';

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
    >
      {party ? (
        <>
          <PartyHeader
            party={party}
            candidacy={presidential?.candidacy ?? null}
            onOpenFamily={() => setSheet('famille')}
            onOpenCandidate={() => setSheet('candidat')}
          />
          <Tabs
            tabs={vm.sections}
            value={section}
            hrefOf={(sectionId) => partyHref(party.id, sectionId)}
            navLabel="Sections de la fiche"
          />
          <Slot />

          <Sheet
            isOpen={sheet === 'famille'}
            onClose={() => setSheet(null)}
            title="Famille politique"
          >
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.family}</Text>
            <Text style={{ color: colors.text.secondary }}>
              Les étiquettes viennent de la presse de référence, des politistes et du ministère de
              l'Intérieur ; chaque parti peut les contester. Le même traitement s'applique à tous.
            </Text>
          </Sheet>
          {presidential ? (
            <Sheet
              isOpen={sheet === 'candidat'}
              onClose={() => setSheet(null)}
              title={`Candidature 2027 : ${presidential.candidacy.candidateName}`}
            >
              <StatusChip label={presidential.candidacy.statusLabel} />
              <Text style={{ fontSize: 16, lineHeight: 25 }}>
                {presidential.candidacy.candidate}
              </Text>
            </Sheet>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}
