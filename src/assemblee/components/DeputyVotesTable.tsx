import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextInput } from '@/components/ui/TextInput';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { t } from '@/src/assemblee/i18n/translate';
import { orderedPositions, positionLabel } from '@/src/assemblee/models/deputy-table';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';
import type { SeatGlyph } from '@/src/assemblee/models/seat-view';
import type { HemicycleView } from '@/src/assemblee/view-models/scrutin.view-model';

type Ready = Extract<HemicycleView, { status: 'ready' }>;

const GLYPH: Record<VoteCode, SeatGlyph> = {
  P: 'disc',
  C: 'disc-slash',
  A: 'ring',
  N: 'dot',
  '-': 'dashed',
  '.': 'none',
};

const MIN_WIDTH = 520;

/**
 * Tableau des députés, filtrable par nom, groupe et position, toujours par ordre alphabétique.
 * Position officielle en toutes lettres avec sa forme ; vote par délégation dans sa colonne ;
 * mise au point présentée comme telle, sans effet sur la position affichée.
 */
export function DeputyVotesTable({ view }: { view: Ready }) {
  const { colors, effects, fonts } = useTheme();
  const [recherche, setRecherche] = useState('');
  const [groupe, setGroupe] = useState<number | null>(null);
  const [vote, setVote] = useState<VoteCode | null>(null);
  const [frame, setFrame] = useState(0);

  const positions = useMemo(
    () =>
      orderedPositions(
        view.rows.map((r) => r.vote),
        view.censure
      ),
    [view.rows, view.censure]
  );
  const shown = useMemo(
    () => view.filter({ recherche, groupe, vote }),
    [view, recherche, groupe, vote]
  );

  const chip = (key: string, label: string, active: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1.5,
        borderColor: active ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: active ? colors.tintSoft : 'transparent',
      }}
    >
      <Text style={active ? { ...fonts.bold, color: colors.tint, fontSize: 14 } : { fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );

  const filterGroup = (label: string, children: React.ReactNode) => (
    <View role="group" aria-label={label} style={{ gap: effects.spacing.xs }}>
      <Text variant="label">{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <TextInput
        variant="primary"
        label={t('deputies.search')}
        placeholder={t('deputies.searchPlaceholder')}
        value={recherche}
        onChangeText={setRecherche}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={t('deputies.search')}
      />
      {filterGroup(
        t('deputies.filterGroup'),
        <>
          {chip('tous', t('deputies.all'), groupe === null, () => setGroupe(null))}
          {view.groupes.map((g) =>
            chip(String(g.index), g.abrev, groupe === g.index, () =>
              setGroupe(groupe === g.index ? null : g.index)
            )
          )}
        </>
      )}
      {filterGroup(
        t('deputies.filterPosition'),
        <>
          {chip('tous', t('deputies.all'), vote === null, () => setVote(null))}
          {positions.map((code) =>
            chip(code, positionLabel(code, view.censure), vote === code, () =>
              setVote(vote === code ? null : code)
            )
          )}
        </>
      )}
      <Text aria-live="polite" style={{ fontSize: 14, color: colors.text.secondary }}>
        {t('deputies.count', { count: shown.length })}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={frame > 0 && frame < MIN_WIDTH}
        onLayout={(e) => setFrame(e.nativeEvent.layout.width)}
        contentContainerStyle={{ minWidth: '100%' }}
        style={{
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.surface.primary,
        }}
      >
        <View
          role="table"
          aria-label={t('deputies.caption')}
          style={{ minWidth: MIN_WIDTH, flexGrow: 1 }}
        >
          <View
            role="row"
            style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}
          >
            <Text role="columnheader" variant="label" style={{ flex: 3, minWidth: 0 }}>
              {t('deputies.name')}
            </Text>
            <Text role="columnheader" variant="label" style={{ flex: 1, minWidth: 0 }}>
              {t('deputies.group')}
            </Text>
            <Text role="columnheader" variant="label" style={{ flex: 2, minWidth: 0 }}>
              {t('deputies.position')}
            </Text>
            <Text role="columnheader" variant="label" style={{ width: 72 }}>
              {t('deputies.delegation')}
            </Text>
          </View>
          {shown.length === 0 ? (
            <Text style={{ padding: 12, color: colors.text.secondary }}>{t('deputies.none')}</Text>
          ) : null}
          {shown.map((row, i) => (
            <View
              key={`${row.id}-${i}`}
              role="row"
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderTopWidth: 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <View role="rowheader" style={{ flex: 3, minWidth: 0, gap: 2 }}>
                <Text style={{ fontSize: 15, lineHeight: 21, color: colors.text.primary }}>
                  {row.nom}
                </Text>
                {row.miseAuPoint ? (
                  <Text style={{ fontSize: 13, lineHeight: 18, color: colors.text.secondary }}>
                    {row.miseAuPoint}
                  </Text>
                ) : null}
              </View>
              <Text role="cell" style={{ flex: 1, minWidth: 0, fontSize: 15 }}>
                {row.groupe}
              </Text>
              <View
                role="cell"
                style={{ flex: 2, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <VoteGlyph glyph={GLYPH[row.vote]} size={16} />
                <Text style={{ fontSize: 15, flexShrink: 1 }}>{row.position}</Text>
              </View>
              <Text role="cell" style={{ width: 72, fontSize: 15 }}>
                {row.delegation ? t('deputies.yes') : ''}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
