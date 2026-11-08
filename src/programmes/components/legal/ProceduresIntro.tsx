import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { STATUS_LABELS } from '@/src/programmes/models/legal/legal-vocabulary';

/** Texte fixe : le même périmètre, les mêmes garde-fous pour les dix partis. */
const SCOPE = [
  'le parti lui-même (personne morale, micro-parti, association de financement) ;',
  'ses fondateurs, présidents, secrétaires nationaux et porte-paroles nationaux, actuels et passés ;',
  "ses candidats à l'élection présidentielle ;",
  "ses parlementaires (députés, sénateurs, députés européens), pour des faits commis pendant leur mandat ou liés à l'activité politique ;",
  'ses ministres.',
];

export function ProceduresIntro({ reviewedOn }: { reviewedOn: string }) {
  const { colors, effects } = useTheme();
  return (
    <Card>
      <Text style={{ fontSize: 16, lineHeight: 25 }}>
        Présomption d'innocence : une enquête, une mise en examen ou une condamnation non définitive
        n'établit pas la culpabilité.
      </Text>
      {/* Périmètre et statuts repliés ; l'avertissement et la présomption d'innocence restent visibles. */}
      <Accordion flat last headingLevel={2} title="Ce que recense cette page">
        <Text style={{ fontSize: 16, lineHeight: 25 }}>
          Chaque procédure indique son statut juridique exact, la juridiction, les dates, les
          recours en cours et au moins deux sources indépendantes. Les issues favorables (relaxe,
          acquittement, non-lieu, classement) sont toujours indiquées lorsque la procédure a été
          rendue publique.
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>
          Les procédures judiciaires, de la même façon pour tous les partis, visant :
        </Text>
        <View style={{ gap: effects.spacing.xxs }}>
          {SCOPE.map((item) => (
            <View key={item} style={{ flexDirection: 'row', gap: effects.spacing.xs }}>
              <Text style={{ width: 12, fontSize: 15, lineHeight: 23 }}>·</Text>
              <Text style={{ flex: 1, fontSize: 15, lineHeight: 23 }}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text.secondary }}>
          Statuts utilisés : {Object.values(STATUS_LABELS).join(' · ')}.
        </Text>
      </Accordion>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          Recensement arrêté au {reviewedOn}.
        </Text>
      </View>
    </Card>
  );
}
