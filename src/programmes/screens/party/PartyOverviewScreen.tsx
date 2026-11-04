import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { SourcedAccordionList } from '@/src/programmes/components/SourcedAccordionList';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { splitIdeals } from '@/src/programmes/models/ideals.service';
import { legacyTabRedirect } from '@/src/programmes/models/seo/party-sections';
import { bodyText } from '@/src/programmes/models/sourced-item.service';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/** « En bref » : /partis/[id]. */
export default function PartyOverviewScreen() {
  const { id, onglet } = useLocalSearchParams<{ id: string; onglet?: string }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const router = useRouter();
  const party = vm.party;
  const presidential = vm.presidential;

  // Anciens liens `?onglet=` : redirection dans un effet (jamais au rendu, pour l'hydratation).
  useEffect(() => {
    const target = legacyTabRedirect(id, onglet);
    if (target && target !== `/partis/${id}`) router.replace(target as never);
    else if (target) router.setParams({ onglet: undefined });
  }, [id, onglet, router]);

  if (!party) return null;
  const { classification, others } = splitIdeals(party.history?.ideals ?? []);
  const meta = vm.metaBySection?.['en-bref'];

  return (
    <TabPanel id="en-bref">
      {meta ? <SeoHead meta={meta} /> : null}
      <View style={{ gap: effects.spacing.sm }}>
        <Text variant="caption" headingLevel={2}>
          En bref
        </Text>
        <Card style={{ gap: 0, paddingVertical: 4 }}>
          {[
            ['Fondé', party.history?.founded],
            [
              'Candidature 2027',
              presidential
                ? `${presidential.candidacy.candidateName} · ${presidential.candidacy.statusLabel}`
                : null,
            ],
          ]
            .filter(([, value]) => value)
            .map(([label, value], index) => (
              <View
                key={label}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: colors.surface.border.primary,
                }}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{label}</Text>
                <Text style={{ ...fonts.bold, fontSize: 16 }}>{value}</Text>
              </View>
            ))}
        </Card>
        <SourcedAccordionList items={others} />
        <Accordion
          title="Présentation complète"
          subtitle="Chiffres, dirigeants, situation actuelle"
        >
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.description}</Text>
        </Accordion>
        <Accordion
          title="Famille politique : comment le parti est classé"
          subtitle="Étiquette, qui l'emploie, position du parti"
        >
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.family}</Text>
          {classification.map((item) => (
            <View key={item.title} style={{ gap: effects.spacing.xs }}>
              <Text style={{ ...fonts.bold, fontSize: 16 }}>{item.title}</Text>
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{bodyText(item)}</Text>
              <SourceChip sources={item.sources} subject={item.title} />
            </View>
          ))}
          <Text style={{ color: colors.text.secondary }}>
            Les étiquettes viennent de la presse de référence, des politistes et du ministère de
            l'Intérieur ; chaque parti peut les contester. Le même traitement s'applique à tous.
          </Text>
        </Accordion>
      </View>
      <PageSources sources={vm.sourcesBySection['en-bref']} />
    </TabPanel>
  );
}
