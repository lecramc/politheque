import { Link } from 'expo-router';
import React, { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import type { Party } from '@/src/programmes/models/programme.model';
import { partyHref, type PartySection } from '@/src/programmes/models/seo/party-sections';

/** Ligne dense d'une liste de partis : anneau, nom, une ligne de contexte, chevron. */
export function PartyRow({
  party,
  subtitle,
  trailing,
  section,
  first = false,
}: {
  party: Party;
  subtitle?: string;
  trailing?: ReactNode;
  /** Section de la fiche à ouvrir (vraie route, indexable). */
  section?: PartySection;
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
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ ...fonts.bold, fontSize: 16 }}>{party.name}</Text>
          {subtitle ? (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
        <Icon name="chevron-forward" variant="secondary" size="small" />
      </Pressable>
    </Link>
  );
}

/** Conteneur blanc qui regroupe des lignes. */
export function RowGroup({ children }: { children: ReactNode }) {
  const { colors, effects } = useTheme();
  return (
    <View
      role="list"
      style={{
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        borderRadius: effects.borderRadius.small,
        overflow: 'hidden',
      }}
    >
      {React.Children.map(children, (child) =>
        child ? <View role="listitem">{child}</View> : null
      )}
    </View>
  );
}
