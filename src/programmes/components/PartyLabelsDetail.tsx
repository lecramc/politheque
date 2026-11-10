import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { Accordion } from '@/src/programmes/components/Accordion';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { EtiquetteDetail } from '@/src/programmes/models/etiquettes.service';

/** Lien vers la leçon qui explique qui classe les partis (le bloc « aux extrêmes »). */
export const LABELS_LESSON_HREF = '/comprendre/gauche-droite';

/**
 * Contenu de la feuille « D'où viennent ces classements ? » : une phrase en clair construite par le
 * modèle, ce que dit le parti, puis les références (nuance, circulaire, Conseil d'État, sources)
 * repliées. Mêmes blocs, même ordre, pour tous les partis ; un classement absent dit pourquoi.
 */
export function PartyLabelsDetail({
  detail,
  onNavigate,
}: {
  detail: EtiquetteDetail;
  onNavigate: () => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const body = { fontSize: 16, lineHeight: 25 } as const;
  const secondary = { fontSize: 15, lineHeight: 23, color: colors.text.secondary } as const;
  return (
    <>
      <Text style={{ fontSize: 17, lineHeight: 26 }}>{detail.summary}</Text>

      {detail.party ? (
        <View style={{ gap: effects.spacing.xs }}>
          <Text style={{ ...fonts.bold, fontSize: 17 }}>Ce qu'en dit le parti</Text>
          <Text style={body}>{detail.party.text}</Text>
        </View>
      ) : null}

      <Accordion title="Références" headingLevel={3}>
        <View style={{ gap: effects.spacing.xs }}>
          <Text style={{ ...fonts.bold, fontSize: 16 }}>
            {`${detail.ministry.title} : ${detail.ministry.value}`}
          </Text>
          {detail.ministry.nuance ? (
            <Text style={body}>{`Nuance : ${detail.ministry.nuance}.`}</Text>
          ) : null}
          {detail.ministry.note ? <Text style={secondary}>{detail.ministry.note}</Text> : null}
          {detail.ministry.nullReason ? (
            <Text style={secondary}>{detail.ministry.nullReason}</Text>
          ) : null}
          <Text
            style={secondary}
          >{`${detail.ministry.circular}, pour les municipales de 2026.`}</Text>
          {detail.ministry.councilOfState.map((decision) => (
            <Text key={decision.url} style={secondary}>
              {decision.label}
            </Text>
          ))}
        </View>

        <View style={{ gap: effects.spacing.xs }}>
          <Text style={{ ...fonts.bold, fontSize: 16 }}>
            {`${detail.press.title} : ${detail.press.value}`}
          </Text>
          {detail.press.usedBy ? (
            <Text style={body}>{`Étiquette employée par ${detail.press.usedBy}.`}</Text>
          ) : null}
          {detail.press.note ? <Text style={secondary}>{detail.press.note}</Text> : null}
          {detail.press.nullReason ? (
            <Text style={secondary}>{detail.press.nullReason}</Text>
          ) : null}
        </View>

        <SourceChip sources={detail.sources} subject="Classements du parti" />
      </Accordion>
      <Text style={secondary}>
        Ces étiquettes décrivent une position dans le paysage politique ; elles ne sont pas un
        jugement. Chaque parti peut les contester. Le même traitement s'applique à tous.
      </Text>
      <TextLink href={LABELS_LESSON_HREF} standalone onPress={onNavigate}>
        Qui classe les partis aux « extrêmes » ?
      </TextLink>
    </>
  );
}
