import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextInput } from '@/components/ui/TextInput';
import { ChoiceRow } from '@/src/assemblee/components/ChoiceRow';
import { ConstituencyFinder } from '@/src/assemblee/components/ConstituencyFinder';
import { FilterButton } from '@/src/assemblee/components/FilterButton';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';
import { SEAT_GLYPHS } from '@/src/assemblee/models/seat-view';
import type { HemicycleView } from '@/src/assemblee/view-models/scrutin.view-model';
import { Sheet } from '@/src/programmes/components/Sheet';

type Ready = Extract<HemicycleView, { status: 'ready' }>;

/**
 * « Chercher un député » : le champ d'abord, la liste seulement dès qu'on tape, qu'on filtre ou
 * qu'on la demande (574 lignes d'office, c'est une page de 26 000 px). Une rangée sur deux
 * niveaux, sans colonnes : le nom, puis la position avec sa forme · le sigle du groupe · « vote
 * confié à un collègue » quand c'est le cas. Les filtres (groupe, position) sont dans une feuille,
 * avec le même ordre des groupes que le reste de la page.
 */
export function DeputySearch({ view, order }: { view: Ready; order: GroupeOrder }) {
  const { colors, effects, fonts } = useTheme();
  const [recherche, setRecherche] = useState('');
  const [groupe, setGroupe] = useState<number | null>(null);
  const [vote, setVote] = useState<VoteCode | null>(null);
  const [requested, setRequested] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [depute, setDepute] = useState<string | null>(null);
  const [finderOpen, setFinderOpen] = useState(false);

  const result = useMemo(
    () => view.search({ recherche, groupe, vote, depute }, requested),
    [view, recherche, groupe, vote, depute, requested]
  );
  const filterLabel = COPY.deputies.filterButton(result.filterCount);

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: effects.spacing.xs }}>
        <View style={{ flex: 1 }}>
          <TextInput
            variant="primary"
            label={COPY.deputies.search}
            placeholder={COPY.deputies.searchPlaceholder}
            value={recherche}
            onChangeText={(text) => {
              setRecherche(text);
              setDepute(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={COPY.deputies.search}
          />
        </View>
        <FilterButton
          label={filterLabel}
          active={result.filterCount > 0}
          onPress={() => setSheetOpen(true)}
        />
      </View>

      <Pressable
        onPress={() => setFinderOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: finderOpen }}
        style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
      >
        <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
          {finderOpen ? COPY.constituency.close : COPY.constituency.open}
        </Text>
      </Pressable>
      {finderOpen ? (
        <ConstituencyFinder
          constituency={view.constituency}
          onPick={(id) => {
            setDepute(id);
            setRecherche('');
            setFinderOpen(false);
          }}
        />
      ) : null}

      {result.visible ? (
        <>
          <Text aria-live="polite" style={{ fontSize: 14, color: colors.text.secondary }}>
            {result.countLabel}
          </Text>
          {result.rows.length === 0 ? (
            <Text style={{ color: colors.text.secondary }}>{result.emptyLabel}</Text>
          ) : (
            <View
              role="list"
              aria-label={COPY.deputies.listLabel}
              style={{
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
                borderRadius: effects.borderRadius.small,
                backgroundColor: colors.surface.primary,
                overflow: 'hidden',
              }}
            >
              {result.rows.map((row, i) => (
                <View
                  key={`${row.id}-${i}`}
                  role="listitem"
                  style={{
                    gap: 2,
                    paddingVertical: 10,
                    paddingHorizontal: effects.spacing.md,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderColor: colors.surface.border.primary,
                  }}
                >
                  <Text style={{ ...fonts.semibold, fontSize: 16, lineHeight: 22 }}>{row.nom}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <VoteGlyph glyph={SEAT_GLYPHS[row.vote]} size={16} />
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 21,
                        flex: 1,
                        color: colors.text.secondary,
                      }}
                    >
                      {row.details}
                    </Text>
                  </View>
                  {row.miseAuPoint ? (
                    <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>
                      {row.miseAuPoint}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
          {requested ? (
            <Pressable
              onPress={() => setRequested(false)}
              accessibilityRole="button"
              style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
                {COPY.deputies.hideAll}
              </Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <Pressable
          onPress={() => setRequested(true)}
          accessibilityRole="button"
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
            {result.showAllLabel}
          </Text>
        </Pressable>
      )}

      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={COPY.deputies.filterTitle}
      >
        <Text variant="label">{COPY.deputies.filterGroup}</Text>
        <View role="radiogroup" aria-label={COPY.deputies.filterGroup} style={{ gap: 6 }}>
          <ChoiceRow
            label={COPY.deputies.allGroups}
            selected={groupe === null}
            onPress={() => setGroupe(null)}
          />
          {view.groupes(order).map((g) => (
            <ChoiceRow
              key={g.index}
              label={g.name}
              color={g.color}
              selected={groupe === g.index}
              onPress={() => setGroupe(g.index)}
            />
          ))}
        </View>
        <Text variant="label">{COPY.deputies.filterPosition}</Text>
        <View role="radiogroup" aria-label={COPY.deputies.filterPosition} style={{ gap: 6 }}>
          <ChoiceRow
            label={COPY.deputies.allPositions}
            selected={vote === null}
            onPress={() => setVote(null)}
          />
          {view.positions.map((p) => (
            <ChoiceRow
              key={p.code}
              label={p.label}
              selected={vote === p.code}
              onPress={() => setVote(p.code)}
            />
          ))}
        </View>
        {result.filterCount > 0 ? (
          <Pressable
            onPress={() => {
              setGroupe(null);
              setVote(null);
            }}
            accessibilityRole="button"
            style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {COPY.deputies.reset}
            </Text>
          </Pressable>
        ) : null}
      </Sheet>
    </View>
  );
}
