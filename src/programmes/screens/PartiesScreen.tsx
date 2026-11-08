import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Page } from '@/src/programmes/components/Page';
import { PartyRow, RowGroup } from '@/src/programmes/components/PartyRow';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';
import { partiesViewModel } from '@/src/programmes/view-models/parties.view-model';

const ELECTION_ID = 'presidentielle-2027';
const metaViewModel = pageMetaViewModel((catalog) => rubricMeta('partis', catalog));

export default function PartiesScreen() {
  const vm = useViewModel(partiesViewModel);
  const meta = useViewModel(metaViewModel);
  const { colors, effects, fonts } = useTheme();
  const [onlyRunning, setOnlyRunning] = useState(false);
  const parties = onlyRunning ? vm.parties.filter((p) => p.candidacies[ELECTION_ID]) : vm.parties;

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1.5,
        borderColor: active ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: active ? colors.tintSoft : 'transparent',
      }}
    >
      <Text
        style={{
          ...(active ? fonts.bold : fonts.regular),
          color: active ? colors.tint : colors.text.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Page meta={meta} loading={vm.status !== 'loaded'} template="hub">
      <View style={{ gap: effects.spacing.lg }}>
        <View {...tv('list-col')} style={{ gap: 6 }}>
          <Text variant="title">Les partis</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
            {vm.parties.length} partis, par ordre alphabétique.
          </Text>
        </View>
        <ScrollView
          {...tv('list-col')}
          horizontal
          showsHorizontalScrollIndicator={false}
          // Marge intérieure (compensée à l'extérieur) : l'anneau de focus n'est pas rogné.
          style={{ margin: -effects.spacing.xs }}
          contentContainerStyle={{ gap: effects.spacing.xs, padding: effects.spacing.xs }}
        >
          {chip('Tous', !onlyRunning, () => setOnlyRunning(false))}
          {chip('Avec une candidature en 2027', onlyRunning, () => setOnlyRunning(true))}
        </ScrollView>
        <RowGroup grid>
          {parties.map((party, index) => {
            const candidacy = party.candidacies[ELECTION_ID];
            const founded = party.history
              ? `Fondé en ${party.history.founded.match(/\d{4}/)?.[0] ?? ''}`
              : '';
            const candidate = candidacy ? `Candidature : ${candidacy.candidateName}` : '';
            return (
              <PartyRow
                key={party.id}
                party={party}
                first={index === 0}
                subtitle={[founded, candidate].filter(Boolean).join(' · ')}
              />
            );
          })}
        </RowGroup>
      </View>
    </Page>
  );
}
