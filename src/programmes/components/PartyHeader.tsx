import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { tv } from '@/src/core/web/tv';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { beforeParenthesis } from '@/src/programmes/models/presentation.service';
import type { Party } from '@/src/programmes/models/programme.model';

/**
 * En-tête commun aux pages d'une fiche : le h1 est le nom du parti (l'entité), puis une ligne
 * famille (ligne seule), puis « Fondé en… · dirigeant » en dessous, et « Comparer avec… ». La
 * candidature est dans l'onglet Programme ; la date de vérification, dans « Sources de cette page ».
 */
export function PartyHeader({
  party,
  identityLine,
  compareHref,
  onOpenFamily,
}: {
  party: Party;
  identityLine: string;
  /** « Comparer avec… » : l'outil s'ouvre avec ce parti en premier, le second est à choisir. */
  compareHref: string;
  onOpenFamily: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const family = beforeParenthesis(party.family);
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: effects.spacing.smd, alignItems: 'center' }}>
        <PartyDot color={party.color} size={56} label={party.shortName} />
        <Text {...tv('party-name')} variant="title" style={styles.name}>
          {party.name}
        </Text>
      </View>
      <View>
        <Pressable
          onPress={onOpenFamily}
          accessibilityRole="button"
          accessibilityLabel={`Famille politique : ${family}. Voir qui emploie cette étiquette.`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: effects.spacing.xxs,
            minHeight: 44,
          }}
        >
          <Text
            style={{
              ...fonts.bold,
              fontSize: 16,
              color: colors.text.primary,
              textDecorationLine: 'underline',
              textDecorationStyle: 'dotted',
            }}
          >
            {family}
          </Text>
          <Icon name="information-circle-outline" variant="onGlass" size="small" />
        </Pressable>
        <Text style={{ fontSize: 16, color: colors.text.secondary }}>{identityLine}</Text>
      </View>
      {/* Même action, même place, pour les dix partis. Aucun compteur de procédures. */}
      <View style={{ alignSelf: 'flex-start' }}>
        <Button variant="secondary" fullWidth={false} href={compareHref}>
          Comparer avec…
        </Button>
      </View>
    </View>
  );
}

// Dans un StyleSheet : la CSS desktop (`party-name`) ne peut surcharger que des classes.
const styles = StyleSheet.create({ name: { flex: 1, fontSize: 30, lineHeight: 35 } });
