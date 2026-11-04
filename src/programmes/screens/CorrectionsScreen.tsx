import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { CorrectionItem } from '@/src/programmes/components/corrections/CorrectionItem';
import { Page } from '@/src/programmes/components/Page';
import { CORRECTION_KIND_LABELS } from '@/src/programmes/models/corrections/corrections.model';
import { correctionsViewModel } from '@/src/programmes/view-models/corrections.view-model';

const KIND_MEANING = [
  ['correction', 'une information publiée était inexacte.'],
  [
    'mise-a-jour',
    "l'information était juste, la réalité a changé (déclaration, décision de justice, candidature).",
  ],
  ['ajout', 'une information, une section ou une fiche nouvelle.'],
  ['retrait', 'une information retirée (source insuffisante, hors périmètre).'],
] as const;

export default function CorrectionsScreen() {
  const vm = useViewModel(correctionsViewModel);
  const { colors, effects, fonts } = useTheme();

  return (
    <Page meta={vm.meta} loading={vm.status !== 'loaded'} back={{ label: 'Retour', href: '/' }}>
      <View style={{ gap: 6 }}>
        <Text variant="title">Journal des corrections</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
          Toutes les modifications de fond du contenu, datées, de la plus récente à la plus
          ancienne.
        </Text>
      </View>

      <View id="politique" style={{ gap: effects.spacing.sm }}>
        <Text variant="caption" headingLevel={2}>
          Notre politique de correction
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>
          Une modification est inscrite ici dès qu'elle change le sens d'un contenu affiché : un
          fait, une date, un chiffre, une citation, une position du questionnaire, un statut de
          candidature, l'ajout ou le retrait d'une information. Les corrections d'orthographe ou de
          mise en page n'y figurent pas. Le journal commence à la mise en ligne du site, le 3
          novembre 2026.
        </Text>
        <View style={{ gap: 4 }}>
          {KIND_MEANING.map(([kind, meaning]) => (
            <Text key={kind} style={{ fontSize: 15, lineHeight: 23 }}>
              <Text style={{ ...fonts.bold, fontSize: 15 }}>{CORRECTION_KIND_LABELS[kind]}</Text> :{' '}
              {meaning}
            </Text>
          ))}
        </View>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>
          Un moyen de signaler une erreur arrivera prochainement.
        </Text>
      </View>

      {vm.isEmpty ? (
        <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
          Aucune correction n'a encore été publiée depuis la mise en ligne.
        </Text>
      ) : (
        vm.months.map((month) => (
          <View key={month.key} style={{ gap: effects.spacing.sm }}>
            <Text variant="caption" headingLevel={2}>
              {month.label}
            </Text>
            {month.entries.map((item) => (
              <CorrectionItem key={item.id} item={item} />
            ))}
          </View>
        ))
      )}
    </Page>
  );
}
