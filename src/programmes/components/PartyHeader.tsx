import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import type { PartyAssembleeLine } from '@/src/assemblee/models/party-assemblee-line';
import { useMarkOutline } from '@/src/core/hooks/useMarkOutline';
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
  assemblee,
  onOpenLabels,
}: {
  party: Party;
  /** Les deux lignes d'étiquettes, identiques dans leur forme pour tous les partis. */
  labels: LabelLine[];
  identityLine: string;
  /** « Comparer avec… » : l'outil s'ouvre avec ce parti en premier, le second est à choisir. */
  compareHref: string;
  /** « À l'Assemblée : groupe X · N députés · voir ses votes », sur les 4 onglets. */
  assemblee: PartyAssembleeLine | null;
  onOpenLabels: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const outline = useMarkOutline(party.color);
  const groupOutline = useMarkOutline(assemblee?.color ?? party.color);
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: effects.spacing.smd, alignItems: 'center' }}>
        <PartyDot color={party.color} size={56} label={party.shortName} />
        <Text {...tv('party-name')} variant="title" style={styles.name}>
          {party.name}
        </Text>
      </View>
      {/* Filet de la couleur du parti, sobre ; le contour garde visibles les couleurs claires. */}
      <View
        style={{
          height: 5,
          borderRadius: 3,
          backgroundColor: party.color,
          borderWidth: 1,
          borderColor: outline,
        }}
      />
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
      {assemblee ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          {assemblee.color ? (
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: assemblee.color,
                borderWidth: 1,
                borderColor: groupOutline,
                marginTop: 3,
              }}
            />
          ) : null}
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>
            {assemblee.lead}
            {assemblee.link ? (
              <>
                {' '}
                <TextLink href={assemblee.link.href}>{assemblee.link.label}</TextLink>
              </>
            ) : null}
          </Text>
        </View>
      ) : null}
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
