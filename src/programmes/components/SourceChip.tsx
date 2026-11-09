import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme, useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useColorStyle } from '@/components/webTheme';
import { tv } from '@/src/core/web/tv';
import { Sheet } from '@/src/programmes/components/Sheet';
import { formatLongDate, SOURCE_KIND_LABEL } from '@/src/programmes/models/presentation.service';
import type { Source } from '@/src/programmes/models/programme.model';
import { verificationLevel } from '@/src/programmes/models/verification.service';

const LEVEL_TEXT = {
  croisee:
    'Information recoupée : au moins 2 sites différents, dont un indépendant du parti (presse, source officielle ou vote public).',
  'source-unique': "Source unique : nous n'avons pas trouvé de seconde source indépendante.",
  'non-sourcee': 'Information non sourcée.',
} as const;

const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** Micro-arc à 2 segments : 2 pleins = recoupée, 1 = source unique. */
function MicroArc({ full }: { full: boolean }) {
  const { colors } = useTheme();
  return (
    <Svg width={18} height={10}>
      <Path d="M 2 9 A 7 7 0 0 1 9 2" stroke={colors.tint} strokeWidth={2.5} fill="none" />
      <Path
        d="M 9 2 A 7 7 0 0 1 16 9"
        stroke={full ? colors.tint : colors.surface.border.tertiary}
        strokeWidth={2.5}
        fill="none"
        strokeDasharray={full ? undefined : '2 2'}
      />
    </Svg>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  const c = useColorStyle();
  return (
    <View role="list" style={styles.list}>
      {sources.map((source) => (
        <View key={source.url + source.title} role="listitem">
          <Pressable
            // Sur le web : vrai lien <a href> ouvert dans un nouvel onglet ; sur natif : navigateur.
            {...(Platform.OS === 'web'
              ? { href: source.url, hrefAttrs: { target: '_blank', rel: 'noopener' } }
              : { onPress: () => Linking.openURL(source.url) })}
            accessibilityRole="link"
            accessibilityLabel={`${source.title}, ${domainOf(source.url)} (nouvel onglet)`}
            style={[styles.item, c((p) => ({ borderColor: p.surface.border.primary }))]}
          >
            <Text style={[styles.itemMeta, c((p) => ({ color: p.text.secondary }))]}>
              {SOURCE_KIND_LABEL[source.kind] ?? source.kind} · {formatLongDate(source.date)} ·{' '}
              {domainOf(source.url)}
            </Text>
            <Text style={[styles.itemTitle, c((p) => ({ color: p.tint }))]}>{source.title}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

/** Pastille compacte « ✓ 2 sources » / « 1 source » qui ouvre la liste en feuille. */
export function SourceChip({
  sources,
  subject,
  compact = false,
}: {
  sources: Source[];
  subject?: string;
  compact?: boolean;
}) {
  const c = useColorStyle();
  const [open, setOpen] = useState(false);
  if (sources.length === 0) return null;
  const level = verificationLevel(sources);
  const crossChecked = level === 'croisee';
  const label = crossChecked
    ? `✓ ${sources.length} sources`
    : `${sources.length} source${sources.length > 1 ? 's' : ''}`;

  return (
    <>
      {/* Zone cliquable de 44 px minimum ; la pastille, plus compacte sous 768 px, est dedans. */}
      <Pressable
        ring="inside"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${crossChecked ? 'information recoupée' : 'source unique'}. Ouvrir la liste`}
        style={styles.hit}
      >
        <View
          {...tv(compact ? 'source-chip-compact' : 'source-chip')}
          style={[
            compact ? styles.chipCompact : styles.chip,
            crossChecked ? styles.chipSolid : styles.chipDashed,
            c((p) => ({
              borderColor: crossChecked ? p.tintBorder : p.surface.border.tertiary,
              backgroundColor: crossChecked ? p.tintSoft : 'transparent',
            })),
          ]}
        >
          <MicroArc full={crossChecked} />
          <Text style={[styles.chipLabel, c((p) => ({ color: p.tint }))]}>{label}</Text>
        </View>
      </Pressable>
      <Sheet isOpen={open} onClose={() => setOpen(false)} title="D'où vient cette info ?">
        {subject ? (
          <Text style={[styles.subject, c((p) => ({ color: p.text.secondary }))]}>
            « {subject} »
          </Text>
        ) : null}
        <Text>{LEVEL_TEXT[level]}</Text>
        <SourceList sources={sources} />
        <Link href="/methodologie" onPress={() => setOpen(false)}>
          <Text style={[styles.how, c((p) => ({ color: p.tint }))]}>Comment on vérifie →</Text>
        </Link>
      </Sheet>
    </>
  );
}

// Largeurs et hauteurs dans une feuille de style : la CSS (`source-chip`) les élargit dès 768 px.
const styles = StyleSheet.create({
  list: { gap: theme.effects.spacing.xs },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: theme.effects.spacing.xxs,
  },
  itemMeta: { fontSize: 14 },
  itemTitle: { ...theme.fonts.bold, textDecorationLine: 'underline' },
  hit: {
    alignSelf: 'flex-start',
    minHeight: theme.effects.sizes.row.sm,
    justifyContent: 'center',
  },
  chipSolid: { borderStyle: 'solid' },
  chipDashed: { borderStyle: 'dashed' },
  chipLabel: { ...theme.fonts.bold, fontSize: 14 },
  subject: { fontStyle: 'italic' },
  how: { marginTop: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 28,
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: theme.effects.borderRadius.round,
    borderWidth: 1,
  },
  chipCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 28,
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: theme.effects.borderRadius.round,
    borderWidth: 1,
  },
});
