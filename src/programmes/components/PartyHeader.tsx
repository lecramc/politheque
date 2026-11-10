import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { tv } from '@/src/core/web/tv';
import { LabelsLink } from '@/src/programmes/components/LabelsLink';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import type { LabelLine } from '@/src/programmes/models/etiquettes.service';
import type { Party } from '@/src/programmes/models/programme.model';

/**
 * En-tête commun aux pages d'une fiche : le h1 est le nom du parti (l'entité), puis les deux
 * lignes d'étiquettes (ministère de l'Intérieur, presse et politistes) et le lien « D'où vient ce classement ? », puis « Fondé en… ·
 * dirigeant » et « Comparer avec… ». La candidature est dans l'onglet Programme ; la date de
 * vérification, dans « Sources de cette page ».
 */
export function PartyHeader({
  party,
  labels,
  identityLine,
  compareHref,
  onOpenLabels,
}: {
  party: Party;
  /** Les deux lignes d'étiquettes, identiques dans leur forme pour tous les partis. */
  labels: LabelLine[];
  identityLine: string;
  /** « Comparer avec… » : l'outil s'ouvre avec ce parti en premier, le second est à choisir. */
  compareHref: string;
  onOpenLabels: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: effects.spacing.smd, alignItems: 'center' }}>
        <PartyDot color={party.color} size={56} label={party.shortName} />
        <Text {...tv('party-name')} variant="title" style={styles.name}>
          {party.name}
        </Text>
      </View>
      <View>
        {/* Deux classements côte à côte, toujours les deux lignes ; le lien ouvre la feuille. */}
        <View style={{ gap: effects.spacing.xs }}>
          {labels.map((line) => (
            <View key={line.id}>
              <Text style={{ fontSize: 13, lineHeight: 18, color: colors.text.secondary }}>
                {line.title}
              </Text>
              <Text
                style={{ ...fonts.bold, fontSize: 16, lineHeight: 22, color: colors.text.primary }}
              >
                {line.value}
              </Text>
            </View>
          ))}
        </View>
        <LabelsLink onPress={onOpenLabels} />
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
