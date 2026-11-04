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
import { TabPanel } from '@/src/programmes/components/Tabs';
import { afterFirstSentence, firstSentence } from '@/src/programmes/models/presentation.service';
import { legacyTabRedirect } from '@/src/programmes/models/seo/party-sections';
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
        {(party.history?.ideals ?? []).slice(0, 3).map((ideal) => (
          <Accordion key={ideal.text} title={firstSentence(ideal.text)}>
            {afterFirstSentence(ideal.text) ? (
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{afterFirstSentence(ideal.text)}</Text>
            ) : null}
            <SourceChip sources={ideal.sources} />
          </Accordion>
        ))}
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
