import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { LegalStatusLine } from '@/src/programmes/components/legal/LegalStatusLine';
import { LegalStepList } from '@/src/programmes/components/legal/LegalStepList';
import { NextStepNote } from '@/src/programmes/components/legal/NextStepNote';
import { NO_SNIPPET } from '@/src/programmes/components/legal/no-snippet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { PresentedEntry } from '@/src/programmes/models/legal/legal-presentation';

/**
 * Carte compacte : personne et affaire, statut et rappel de présomption collés l'un à l'autre,
 * toujours visibles. La fonction de la personne et le détail sont dans un accordéon monté et masqué une fois fermé. L'ancre `#<id>` permet un lien direct.
 */
export function LegalEntryCard({ entry }: { entry: PresentedEntry }) {
  const { colors, effects } = useTheme();
  return (
    <View id={entry.anchor}>
      <Card>
        <View {...NO_SNIPPET} style={{ gap: effects.spacing.sm }}>
          <Text variant="subtitle" headingLevel={3} style={{ color: colors.text.primary }}>
            {entry.heading}
          </Text>
          <LegalStatusLine
            statusLabel={entry.statusLabel}
            statusDetail={entry.statusDetail}
            presumptionNotice={entry.presumptionNotice}
          />
        </View>
        <Accordion flat last headingLevel={4} title="Détail de la procédure">
          <View {...NO_SNIPPET} style={{ gap: effects.spacing.sm }}>
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              {entry.roleAtTheTime} · {entry.categoryLabel}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 23 }}>Qualification : {entry.offences}.</Text>
            <Text style={{ fontSize: 15, lineHeight: 23, color: colors.text.secondary }}>
              {entry.facts}.
            </Text>
            <LegalStepList steps={entry.steps} />
            {entry.nextStep ? <NextStepNote nextStep={entry.nextStep} /> : null}
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              Vérifiée le {entry.lastVerified}.
            </Text>
            <SourceChip sources={entry.sources} />
          </View>
        </Accordion>
      </Card>
    </View>
  );
}
