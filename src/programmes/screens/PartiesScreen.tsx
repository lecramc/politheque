import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { useScrollToHash } from '@/src/core/hooks/useScrollToHash';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Page } from '@/src/programmes/components/Page';
import { PartyRow, RowGroup } from '@/src/programmes/components/PartyRow';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';
import { partiesViewModel } from '@/src/programmes/view-models/parties.view-model';

const ELECTION_ID = 'presidentielle-2027';
const metaViewModel = pageMetaViewModel((catalog) => rubricMeta('partis', catalog));

function DebateRow({
  debate,
  first = false,
}: {
  debate: { title: string; icon: string; href: string };
  first?: boolean;
}) {
  const { colors, effects } = useTheme();
  return (
    <Link href={debate.href as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.smd,
          minHeight: 56,
          paddingVertical: 10,
          paddingHorizontal: effects.spacing.md,
          borderTopWidth: first ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        <Icon name={debate.icon} variant="onGlass" size="small" />
        <Text style={{ flex: 1, fontSize: 16 }}>{debate.title}</Text>
        <Icon name="chevron-forward" variant="secondary" size="small" />
      </Pressable>
    </Link>
  );
}

/** Partis : les fiches, « Comparer deux partis » et les grands débats (ancre `#debats`). */
export default function PartiesScreen() {
  const vm = useViewModel(partiesViewModel);
  const meta = useViewModel(metaViewModel);
  const { colors, effects } = useTheme();
  useScrollToHash(vm.status === 'loaded');

  return (
    <Page meta={meta} loading={vm.status !== 'loaded'} template="hub">
      <View style={{ gap: effects.spacing.lg }}>
        <View {...tv('list-col')} style={{ gap: effects.spacing.xs }}>
          <Text variant="title">Partis</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
            Ce que veut chaque parti, et ce qu'ils proposent sur chaque grand débat.
          </Text>
          <View style={{ alignSelf: 'flex-start', marginTop: effects.spacing.xs }}>
            <Button variant="secondary" fullWidth={false} href={vm.compareHref}>
              Comparer deux partis
            </Button>
          </View>
        </View>

        <View style={{ gap: effects.spacing.xs }}>
          <View {...tv('list-col')}>
            <Text variant="caption" headingLevel={2}>
              Les {vm.parties.length} partis · A-Z
            </Text>
          </View>
          <RowGroup grid>
            {vm.parties.map((party, index) => {
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

        <View nativeID="debats" style={{ gap: effects.spacing.xs }}>
          <View {...tv('list-col')} style={{ gap: effects.spacing.xxs }}>
            <Text variant="caption" headingLevel={2}>
              Les grands débats
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
              Pour chaque débat : les enjeux, les chiffres clés et ce que propose chaque parti.
            </Text>
          </View>
          <RowGroup grid>
            {vm.debates.map((debate, index) => (
              <DebateRow key={debate.id} debate={debate} first={index === 0} />
            ))}
          </RowGroup>
        </View>
      </View>
    </Page>
  );
}
