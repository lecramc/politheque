import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { appSelector } from '@/src/core/store/create-store';
import { tv } from '@/src/core/web/tv';
import { Card } from '@/src/programmes/components/Card';
import { Page } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { TaskCard } from '@/src/programmes/components/TaskCard';
import { HOME_COPY } from '@/src/programmes/models/home.copy';
import { homeMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalogStatus } from '@/src/programmes/store/programmes.selector';
import { homeViewModel } from '@/src/programmes/view-models/home.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';

const metaViewModel = pageMetaViewModel(homeMeta);

/**
 * Accueil : quatre tâches, les dix partis en accès direct (A-Z, même forme pour tous) et une carte
 * « Le parcours ». Une seule arborescence : la mise en page desktop est dans la feuille `data-tv`.
 */
export default function HomeScreen() {
  const vm = useViewModel(homeViewModel);
  const meta = useViewModel(metaViewModel);
  const status = appSelector(selectCatalogStatus);
  const { colors, effects, fonts } = useTheme();

  return (
    <Page meta={meta} loading={status !== 'loaded'} template="hub">
      <View {...tv('list-col')} style={{ gap: effects.spacing.lg }}>
        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="title">{vm.title}</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>{HOME_COPY.lead}</Text>
        </View>

        <View {...tv('grid-2')} style={{ gap: effects.spacing.sm }}>
          {vm.tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              subtitle={task.subtitle}
              icon={task.icon}
              href={task.href}
              primary={task.primary}
            />
          ))}
        </View>

        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
            {HOME_COPY.partiesTitle}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
            {HOME_COPY.partiesNote}
          </Text>
          <View
            role="list"
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
          >
            {vm.parties.map((party) => (
              <View key={party.id} role="listitem">
                <Link href={party.href as never} asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      minHeight: 44,
                      paddingLeft: 8,
                      paddingRight: 14,
                      borderRadius: effects.borderRadius.round,
                      borderWidth: 1,
                      borderColor: colors.surface.border.primary,
                      backgroundColor: colors.surface.primary,
                    }}
                  >
                    <PartyDot color={party.color} size={28} label={party.shortName} />
                    <Text style={{ fontSize: 16 }}>{party.name}</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
            {HOME_COPY.journeyTitle}
          </Text>
          <Card>
            <Text style={{ ...fonts.bold, fontSize: 17 }}>{vm.journey.title}</Text>
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>{vm.journey.text}</Text>
            <TextLink href={vm.journey.href} standalone>
              {`${vm.journey.cta} →`}
            </TextLink>
            <TextLink href="/passeport" standalone>
              {HOME_COPY.progressLabel}
            </TextLink>
          </Card>
        </View>
      </View>
    </Page>
  );
}
