import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { tv } from '@/src/core/web/tv';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { beforeParenthesis } from '@/src/programmes/models/presentation.service';
import type { Candidacy, Party } from '@/src/programmes/models/programme.model';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * En-tête commun aux pages d'une fiche : le h1 est le nom du parti (l'entité), puis une ligne
 * famille (ligne seule), puis « Fondé en… · dirigeant » en dessous, et la candidature. La date de vérification est dans
 * « Sources de cette page », en bas.
 */
export function PartyHeader({
  party,
  candidacy,
  identityLine,
  onOpenFamily,
  onOpenCandidate,
}: {
  party: Party;
  candidacy: Candidacy | null;
  identityLine: string;
  onOpenFamily: () => void;
  onOpenCandidate: () => void;
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
      {candidacy ? (
        <Pressable
          onPress={onOpenCandidate}
          accessibilityRole="button"
          accessibilityLabel={`Candidature 2027 : ${candidacy.candidateName}, ${lowerFirst(candidacy.statusLabel)}. Voir le détail.`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 56,
            paddingHorizontal: effects.spacing.md,
            paddingVertical: 12,
            borderRadius: effects.borderRadius.small,
            borderWidth: 1,
            borderColor: colors.surface.border.primary,
            backgroundColor: colors.surface.primary,
          }}
        >
          <Text style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
            <Text style={{ ...fonts.bold, fontSize: 16 }}>{candidacy.candidateName}</Text>,{' '}
            {lowerFirst(candidacy.statusLabel)} à la présidentielle 2027
          </Text>
          <Icon name="chevron-forward" variant="secondary" size="small" />
        </Pressable>
      ) : null}
    </View>
  );
}

// Dans un StyleSheet : la CSS desktop (`party-name`) ne peut surcharger que des classes.
const styles = StyleSheet.create({ name: { flex: 1, fontSize: 30, lineHeight: 35 } });
