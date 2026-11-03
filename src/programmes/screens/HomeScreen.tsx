import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Arc } from '@/src/programmes/components/Arc';
import { Page, useIsDesktop } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { formatLongDate } from '@/src/programmes/models/election.service';
import { homeViewModel } from '@/src/programmes/view-models/home.view-model';

const TILES = [
  { href: '/comprendre', icon: 'book-outline', title: 'Comprendre', text: 'Qui décide quoi' },
  { href: '/partis', icon: 'people-outline', title: 'Partis', text: 'Histoire et idées' },
  { href: '/debats', icon: 'chatbubbles-outline', title: 'Débats', text: 'Les grands sujets' },
  { href: '/elections', icon: 'calendar-outline', title: 'Élections', text: 'Dates et règles' },
] as const;

/** Une année de campagne : l'arc du compte à rebours se remplit à l'approche du scrutin. */
const COUNTDOWN_SPAN_DAYS = 365;

export default function HomeScreen() {
  const vm = useViewModel(homeViewModel());
  const { colors, effects, fonts } = useTheme();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const featured = vm.featured;

  const hero = featured ? (
    <LinearGradient
      colors={[colors.pastel.bleu, colors.pastel.creme, colors.pastel.rose]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: isDesktop ? 1 : undefined,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        padding: effects.spacing.md,
        gap: effects.spacing.sm,
        alignItems: 'center',
      }}
    >
      <Text variant="caption">À la une</Text>
      <Text style={{ ...fonts.display, fontSize: 24, textAlign: 'center' }}>
        {featured.election.title}
      </Text>
      {featured.round && featured.daysLeft !== null ? (
        <>
          <Arc
            value={1 - featured.daysLeft / COUNTDOWN_SPAN_DAYS}
            size={200}
            strokeWidth={16}
            accessibilityLabel={`${featured.daysLeft} jours avant le ${featured.round.label}`}
          >
            <Text
              style={{ ...fonts.displayBold, fontSize: 52, lineHeight: 58, color: colors.tint }}
            >
              {featured.daysLeft}
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              jours avant le {featured.round.label}
            </Text>
          </Arc>
          <Text style={{ color: colors.text.secondary }}>
            {featured.round.label} : {formatLongDate(featured.round.date)}
          </Text>
        </>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {featured.candidates.map(({ party }) => (
          <PartyDot key={party.id} color={party.color} size={18} />
        ))}
      </View>
      <View style={{ alignSelf: 'stretch' }}>
        <Button
          variant="brand"
          onPress={() =>
            router.push({ pathname: '/elections/[id]', params: { id: featured.election.id } })
          }
        >
          Voir les candidats
        </Button>
      </View>
    </LinearGradient>
  ) : null;

  return (
    <Page loading={vm.status !== 'loaded'} wide>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: effects.spacing.lg }}>
        <View
          style={{
            flex: isDesktop ? 1 : undefined,
            gap: effects.spacing.md,
            justifyContent: 'center',
          }}
        >
          <Text
            variant="title"
            style={{ fontSize: isDesktop ? 40 : 30, lineHeight: isDesktop ? 46 : 36 }}
          >
            La politique française, expliquée simplement
          </Text>
          {isDesktop ? (
            <Text style={{ color: colors.text.secondary, fontSize: 18 }}>
              Institutions, partis, élections, grands débats : l'essentiel pour se faire son avis,
              avec la source de chaque information.
            </Text>
          ) : null}
        </View>
        {hero}
      </View>

      <View style={{ gap: effects.spacing.sm }}>
        <Text style={{ ...fonts.display, fontSize: 22 }}>Par où commencer ?</Text>
        <Link href="/me-situer" asChild>
          <Pressable
            large
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: effects.spacing.md,
              borderRadius: effects.borderRadius.small,
              backgroundColor: colors.tint,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            >
              <Icon name="compass-outline" variant="onColor" size="medium" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...fonts.display, fontSize: 21, color: colors.text.onColor }}>
                Me situer
              </Text>
              <Text style={{ color: colors.text.onColor, opacity: 0.9 }}>
                {vm.questionCount} affirmations · 5 minutes
              </Text>
            </View>
            <Icon name="chevron-forward" variant="onColor" size="small" />
          </Pressable>
        </Link>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
          {TILES.map((tile) => (
            <Link key={tile.href} href={tile.href} asChild>
              <Pressable
                large
                style={{
                  flexGrow: 1,
                  flexBasis: isDesktop ? 200 : 140,
                  gap: 10,
                  padding: effects.spacing.md,
                  borderRadius: effects.borderRadius.small,
                  borderWidth: 1,
                  borderColor: colors.surface.border.primary,
                  backgroundColor: colors.surface.primary,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tintSoft,
                  }}
                >
                  <Icon name={tile.icon} variant="onGlass" size="medium" />
                </View>
                <Text style={{ ...fonts.bold, fontSize: 17 }}>{tile.title}</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{tile.text}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </Page>
  );
}
