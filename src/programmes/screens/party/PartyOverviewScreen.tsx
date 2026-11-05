import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { FurtherLinks } from '@/src/programmes/components/FurtherLinks';
import { GlanceQuestions } from '@/src/programmes/components/GlanceQuestions';
import { KeyIdeaList } from '@/src/programmes/components/KeyIdeaList';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyJourneyBlock } from '@/src/programmes/components/PartyJourneyBlock';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { legacyTabRedirect, partyHref } from '@/src/programmes/models/seo/party-sections';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « En bref » : /partis/[id]. Ce que le parti propose, ses réponses aux grandes questions, puis le parcours. */
export default function PartyOverviewScreen() {
  const { id, onglet } = useLocalSearchParams<{ id: string; onglet?: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { effects } = useTheme();
  const router = useRouter();
  const party = vm.party;

  // Anciens liens `?onglet=` : redirection dans un effet (jamais au rendu, pour l'hydratation).
  useEffect(() => {
    const target = legacyTabRedirect(id, onglet);
    if (target && target !== `/partis/${id}`) router.replace(target as never);
    else if (target) router.setParams({ onglet: undefined });
  }, [id, onglet, router]);

  if (!party) return null;
  const meta = vm.metaBySection?.['en-bref'];

  return (
    <TabPanel id="en-bref" style={{ gap: effects.spacing.lg }}>
      {meta ? <SeoHead meta={meta} /> : null}
      {vm.keyIdeas ? <KeyIdeaList keyIdeas={vm.keyIdeas} partyName={party.name} /> : null}
      <GlanceQuestions
        items={vm.glance}
        intro={vm.glanceIntro}
        positionsLabel={vm.positionsLabel}
        positionsHref={partyHref(party.id, 'positions')}
      />
      <FurtherLinks links={vm.further} />
      <PageSources
        sources={vm.sourcesBySection['en-bref']}
        verifiedOn={vm.verifiedOn}
        updatedOn={vm.updatedOn}
      />
      {vm.nextParty ? (
        <PartyJourneyBlock
          partyId={party.id}
          nextName={vm.nextParty.name}
          nextHref={partyHref(vm.nextParty.id)}
        />
      ) : null}
    </TabPanel>
  );
}
