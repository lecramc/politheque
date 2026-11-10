import { Link } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { tv } from '@/src/core/web/tv';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import type { Party } from '@/src/programmes/models/programme.model';
import { partyHref, type PartySection } from '@/src/programmes/models/seo/party-sections';

const styles = StyleSheet.create({
  // Traits de la grille à deux colonnes : largeur ici (StyleSheet), la feuille CSS les retire ou
  // les ajoute selon la colonne ; la couleur vient du thème (style en ligne).
  gridTopRule: { borderTopWidth: 1 },
});

/** Ligne dense d'une liste de partis : anneau, nom, une ligne de contexte, chevron. */
export function PartyRow({
  party,
  subtitle,
  detail,
  trailing,
  section,
  badge,
  first = false,
}: {
  party: Party;
  subtitle?: string;
  /** Deuxième ligne de contexte (classements), même forme pour tous. */
  detail?: string;
  trailing?: ReactNode;
  /** Section de la fiche à ouvrir (vraie route, indexable). */
  section?: PartySection;
  /** Pastille affichée sous le nom et le sous-titre (statut de candidature…). Ne prend jamais de largeur au nom. */
  badge?: ReactNode;
  first?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Link href={partyHref(party.id, section) as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 64,
          paddingVertical: 10,
          paddingHorizontal: effects.spacing.md,
          borderTopWidth: first ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        <PartyDot color={party.color} size={36} label={party.shortName} />
        <View style={{ flex: 1, minWidth: 0, gap: effects.spacing.xxs }}>
          <Text style={{ ...fonts.bold, fontSize: 16 }}>{party.name}</Text>
          {subtitle ? (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {detail ? (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{detail}</Text>
          ) : null}
          {badge ? <View style={{ marginTop: effects.spacing.xxs }}>{badge}</View> : null}
        </View>
        {trailing ? <View style={{ flexShrink: 1, maxWidth: '40%' }}>{trailing}</View> : null}
        <Icon name="chevron-forward" variant="secondary" size="small" />
      </Pressable>
    </Link>
  );
}

/** Conteneur blanc qui regroupe des lignes. `grid` : deux colonnes dès 1024 px (CSS). */
export function RowGroup({ children, grid = false }: { children: ReactNode; grid?: boolean }) {
  const { colors, effects } = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View
      role="list"
      {...(grid ? tv('row-grid') : {})}
      style={{
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        borderRadius: effects.borderRadius.small,
        overflow: 'hidden',
      }}
    >
      {items.map((child, index) =>
        grid ? (
          // Grille : c'est l'élément de liste qui porte les traits (la ligne n'en trace pas).
          <View
            key={index}
            role="listitem"
            {...tv(
              'row-item',
              ...(index < 2 ? ['row-no-top'] : []),
              ...(index % 2 === 0 && index < items.length - 1 ? ['row-rule-right'] : [])
            )}
            style={[
              index > 0 ? styles.gridTopRule : null,
              { borderColor: colors.surface.border.primary },
            ]}
          >
            {React.isValidElement<{ first?: boolean }>(child)
              ? React.cloneElement(child, { first: true })
              : child}
          </View>
        ) : (
          <View key={index} role="listitem">
            {child}
          </View>
        )
      )}
    </View>
  );
}
