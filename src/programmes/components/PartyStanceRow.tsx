import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { layout } from '@/components/layout';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { tv } from '@/src/core/web/tv';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { displayName } from '@/src/programmes/models/presentation.service';
import type { Party, PartyStance } from '@/src/programmes/models/programme.model';

/**
 * Ligne « parti x position » (libellé court : un sigle). Même gabarit pour les dix partis ;
 * l'ordre est celui de la liste reçue (alphabétique), jamais celui des positions.
 * - Sous 768 px : anneau, nom, cellule de position à droite ; sources et justification dessous.
 * - À partir de 768 px (CSS `psr`) : grille anneau / nom / position / sources alignées à droite,
 *   justification sous le nom.
 * La couleur du parti n'apparaît que dans l'anneau.
 */
export function PartyStanceRow({
  party,
  stance,
  subject,
  href,
}: {
  party: Party;
  stance?: PartyStance | null;
  /** Le nom devient un lien (fiche du parti). */
  href?: string;
  /** Intitulé lu par la feuille de sources (l'affirmation concernée). */
  subject?: string;
}) {
  const { colors } = useTheme();
  return (
    <View {...tv('psr')} style={styles.row}>
      <PartyDot color={party.color} size={24} label={party.shortName} />
      {href ? (
        <Link href={href as never} style={[styles.name, { color: colors.tint }]}>
          {displayName(party)}
        </Link>
      ) : (
        <Text style={styles.name}>{displayName(party)}</Text>
      )}
      <View {...tv('stance-cell')} style={styles.cell}>
        <StanceBadge stance={stance?.stance ?? null} variant="cell" />
      </View>
      {stance?.sources.length ? (
        <View {...tv('psr-src')} style={styles.full}>
          <SourceChip sources={stance.sources} subject={subject ?? stance.justification} />
        </View>
      ) : null}
      {stance?.justification ? (
        <View {...tv('psr-just')} style={styles.full}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>
            {stance.justification}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 6 },
  name: { flex: 1, fontSize: 14, minWidth: 0 },
  cell: { width: layout.stanceCell.base, flexShrink: 0 },
  full: { flexBasis: '100%' },
});
