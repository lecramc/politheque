import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Arc } from '@/src/programmes/components/Arc';
import { Stamp } from '@/src/programmes/components/Stamp';
import { PARTY_JOURNEY_COPY } from '@/src/programmes/models/journey.copy';
import { partyJourneyViewModel } from '@/src/programmes/view-models/party-journey.view-model';

/**
 * Bloc parcours unique, en bas de fiche : arc, tampon, texte d'état et « Fiche suivante ».
 * Rendu statique = état neutre (arc vide, tampon vide, texte de la règle) avec hauteur réservée ;
 * l'état lu / non lu et le compteur arrivent après l'hydratation.
 */
export function PartyJourneyBlock({
  partyId,
  nextName,
  nextHref,
}: {
  partyId: string;
  nextName: string;
  nextHref: string;
}) {
  const { colors, effects, fonts } = useTheme();
  const vm = useViewModel(partyJourneyViewModel(partyId));
  return (
    <View
      style={{
        borderRadius: effects.borderRadius.small,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.tintBorder,
        backgroundColor: colors.surface.primary,
        padding: effects.spacing.md,
        gap: effects.spacing.sm,
      }}
    >
      <Link href={vm.stepHref as never} asChild>
        <Pressable
          accessibilityRole="link"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 52,
          }}
        >
          <Arc
            value={vm.ratio}
            size={44}
            strokeWidth={5}
            animate={false}
            accessibilityLabel={vm.countLabel ?? vm.heading}
          >
            <Text style={{ ...fonts.displayBold, fontSize: 16, color: colors.tint }}>
              {vm.hydrated ? vm.readCount : ''}
            </Text>
          </Arc>
          <View style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ ...fonts.bold, fontSize: 16 }}>{vm.heading}</Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, minHeight: 20 }}>
              {vm.countLabel ?? ' '}
            </Text>
          </View>
          <Icon name="chevron-forward" variant="secondary" size="small" />
        </Pressable>
      </Link>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.smd,
          minHeight: 64,
          borderTopWidth: 1,
          borderColor: colors.surface.border.primary,
          paddingTop: effects.spacing.sm,
        }}
      >
        <Stamp
          state={vm.stamp}
          size="cover"
          accessibilityLabel={
            vm.stamp === 'stamped' ? 'Fiche lue : tampon obtenu' : 'Tampon pas encore obtenu'
          }
        />
        <View style={{ flex: 1, gap: effects.spacing.xxs }}>
          {vm.title ? <Text style={{ ...fonts.bold, fontSize: 16 }}>{vm.title}</Text> : null}
          {vm.text ? (
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>{vm.text}</Text>
          ) : null}
          {vm.completion ? (
            <Text style={{ fontSize: 16, color: colors.text.secondary }}>{vm.completion.text}</Text>
          ) : null}
        </View>
      </View>
      <Button variant="secondary" href={vm.completion?.nextHref ?? nextHref}>
        {vm.completion?.nextLabel ?? PARTY_JOURNEY_COPY.nextParty(nextName)}
      </Button>
      {vm.completion ? (
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>{vm.completion.privacy}</Text>
      ) : null}
    </View>
  );
}
