import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { useScrollToHash } from '@/src/core/hooks/useScrollToHash';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { MoreText } from '@/src/programmes/components/MoreText';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { withdrawalLabel } from '@/src/programmes/models/candidates.service';
import { formatPartialDate } from '@/src/programmes/models/seo/dates';
import { candidatesViewModel } from '@/src/programmes/view-models/candidates.view-model';

/**
 * Tous les candidats déclarés, à égalité : un seul gabarit, l'ordre alphabétique du nom de
 * famille, aucune couleur de parti, aucun score. Les candidatures retirées sont repliées en bas.
 */
export default function CandidatesScreen() {
  const vm = useViewModel(candidatesViewModel);
  const { colors, effects } = useTheme();
  // Les cartes de la page Partis renvoient à l'entrée d'un candidat (`#id`).
  useScrollToHash(vm.status === 'loaded');

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Présidentielle 2027', href: vm.electionHref }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="title">Les candidats à l'élection présidentielle 2027</Text>
        <Text style={{ fontSize: 17, lineHeight: 26 }}>{vm.intro}</Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>{vm.rule}</Text>
        {vm.deadlineNote ? (
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>{vm.deadlineNote}</Text>
        ) : null}
      </View>

      <View style={{ gap: effects.spacing.sm }}>
        <Text variant="display" headingLevel={2}>
          {`${vm.entries.length} candidats, par ordre alphabétique du nom de famille`}
        </Text>
        <View role="list">
          {vm.entries.map((entry, index) => (
            <View
              key={entry.id}
              role="listitem"
              nativeID={entry.id}
              style={{
                gap: effects.spacing.xs,
                paddingVertical: effects.spacing.md,
                borderTopWidth: index === 0 ? 0 : 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <Text variant="display" headingLevel={3}>
                {entry.name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: effects.spacing.xs,
                }}
              >
                <StatusChip label={entry.statusLabel} />
                {entry.date ? (
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    {formatPartialDate(entry.date)}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontSize: 15, color: colors.text.secondary }}>
                {entry.role ? `${entry.affiliation} · ${entry.role}` : entry.affiliation}
              </Text>
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{entry.summary}</Text>
              {entry.programmeHref ? (
                <TextLink href={entry.programmeHref} standalone>
                  Programme et positions
                </TextLink>
              ) : null}
              <SourceChip sources={entry.sources} subject={entry.name} />
            </View>
          ))}
        </View>
      </View>

      {vm.withdrawn.length ? (
        <View style={{ gap: effects.spacing.xs }}>
          <MoreText label="Candidatures retirées">
            {vm.withdrawn.map((item) => (
              <View key={item.id} style={{ gap: effects.spacing.xxs }}>
                <Text variant="display" headingLevel={3}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                  {withdrawalLabel(item.date)}
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 25 }}>{item.summary}</Text>
                <SourceChip sources={item.sources} subject={item.name} />
              </View>
            ))}
          </MoreText>
        </View>
      ) : null}

      <PageSources sources={vm.allSources} />
    </Page>
  );
}
