import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/src/programmes/components/Sheet';
import { formatSourceDate } from '@/src/programmes/components/SourceLinks';
import type { Source, SourceKind } from '@/src/programmes/models/programme.model';
import { verificationLevel } from '@/src/programmes/models/verification.service';

const KIND_LABEL: Record<SourceKind, string> = {
  programme: 'Programme',
  declaration: 'Déclaration',
  vote: 'Vote',
  'proposition-de-loi': 'Proposition de loi',
  presse: 'Presse',
  statistique: 'Source officielle',
};

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
        stroke={full ? colors.tint : colors.tintBorder}
        strokeWidth={2.5}
        fill="none"
        strokeDasharray={full ? undefined : '2 2'}
      />
    </Svg>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View style={{ gap: effects.spacing.xs }}>
      {sources.map((source) => (
        <Pressable
          key={source.url + source.title}
          // Sur le web : vrai lien <a href> ouvert dans un nouvel onglet ; sur natif : navigateur.
          {...(Platform.OS === 'web'
            ? { href: source.url, hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' } }
            : { onPress: () => Linking.openURL(source.url) })}
          accessibilityRole="link"
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: colors.surface.border.primary,
            gap: 2,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.text.secondary, letterSpacing: 0.4 }}>
            {(KIND_LABEL[source.kind] ?? source.kind).toUpperCase()} ·{' '}
            {formatSourceDate(source.date)} · {domainOf(source.url)}
          </Text>
          <Text style={{ ...fonts.bold, color: colors.tint, textDecorationLine: 'underline' }}>
            {source.title}
          </Text>
        </Pressable>
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
  const { colors, effects, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  if (sources.length === 0) return null;
  const level = verificationLevel(sources);
  const crossChecked = level === 'croisee';
  const label = crossChecked
    ? `✓ ${sources.length} sources`
    : `${sources.length} source${sources.length > 1 ? 's' : ''}`;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        hitSlop={compact ? 8 : 6}
        accessibilityLabel={`${label}, ${crossChecked ? 'information recoupée' : 'source unique'}. Ouvrir la liste`}
        style={{
          alignSelf: 'flex-start',
          minHeight: compact ? 28 : 36,
          flexDirection: 'row',
          alignItems: 'center',
          gap: compact ? 4 : 6,
          paddingHorizontal: compact ? 8 : 10,
          borderRadius: effects.borderRadius.round,
          borderWidth: 1,
          borderStyle: crossChecked ? 'solid' : 'dashed',
          borderColor: crossChecked ? colors.tintBorder : colors.surface.border.tertiary,
          backgroundColor: crossChecked ? colors.tintSoft : 'transparent',
        }}
      >
        <MicroArc full={crossChecked} />
        <Text
          style={{
            ...fonts.bold,
            fontSize: compact ? effects.sizes.text.tiny + 1 : 13,
            color: colors.tint,
          }}
        >
          {label}
        </Text>
      </Pressable>
      <Sheet isOpen={open} onClose={() => setOpen(false)} title="D'où vient cette info ?">
        {subject ? (
          <Text style={{ color: colors.text.secondary, fontStyle: 'italic' }}>« {subject} »</Text>
        ) : null}
        <Text>{LEVEL_TEXT[level]}</Text>
        <SourceList sources={sources} />
        <Link href="/methodologie" onPress={() => setOpen(false)}>
          <Text style={{ color: colors.tint, marginTop: 8 }}>Comment on vérifie →</Text>
        </Link>
      </Sheet>
    </>
  );
}
