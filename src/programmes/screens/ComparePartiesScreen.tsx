import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { MoreText } from '@/src/programmes/components/MoreText';
import { Page } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { ReadingGuide } from '@/src/programmes/components/ReadingGuide';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { parseCompareParams, type CompareTheme } from '@/src/programmes/models/compare.service';
import { displayName } from '@/src/programmes/models/presentation.service';
import { COMPARE_GUIDE_TEXT, GUIDE_ANCHORS } from '@/src/programmes/models/reading-guides.copy';
import { compareViewModel } from '@/src/programmes/view-models/compare.view-model';

type Option = { id: string; name: string; shortName: string; color: string };

/** Largeur de base d'un sélecteur : deux ne tiennent sur une ligne qu'à partir d'environ 500 px. */
const PICKER_BASIS = 240;

function PartyPicker({
  label,
  value,
  options,
  blocked,
  onChange,
}: {
  label: string;
  value: string | null;
  options: Option[];
  blocked: string | null;
  onChange: (id: string) => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.id === value) ?? null;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${chosen ? chosen.name : 'choisir un parti'}`}
        style={{
          // Deux sélecteurs côte à côte quand la ligne le permet, empilés sinon (375 px : « Rassemblement »
          // est un mot insécable, plus large que la moitié de la ligne).
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: PICKER_BASIS,
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: effects.spacing.xs,
          minHeight: 56,
          paddingHorizontal: effects.spacing.sm,
          borderRadius: effects.borderRadius.small,
          borderWidth: 1.5,
          borderColor: chosen ? colors.tint : colors.surface.border.tertiary,
          backgroundColor: colors.surface.primary,
        }}
      >
        {chosen ? <PartyDot color={chosen.color} size={28} label={chosen.shortName} /> : null}
        <Text style={{ ...fonts.bold, fontSize: 15, flex: 1, minWidth: 0 }} numberOfLines={2}>
          {chosen ? chosen.name : label}
        </Text>
        <View style={{ flexShrink: 0 }}>
          <Icon name="chevron-down" variant="secondary" size="small" />
        </View>
      </Pressable>
      <Sheet isOpen={open} onClose={() => setOpen(false)} title={label}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            disabled={option.id === blocked}
            onPress={() => {
              onChange(option.id);
              setOpen(false);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: option.id === value, disabled: option.id === blocked }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: effects.spacing.smd,
              minHeight: 52,
              opacity: option.id === blocked ? 0.4 : 1,
            }}
          >
            <PartyDot color={option.color} size={32} label={option.shortName} />
            <Text style={{ fontSize: 16, flex: 1 }}>{option.name}</Text>
            {option.id === value ? <Icon name="checkmark" variant="onGlass" size="small" /> : null}
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}

function ThemeBlock({ block, names }: { block: CompareTheme; names: [string, string] }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
        {block.theme.title}
      </Text>
      <View {...tv('grid-2')} style={{ gap: effects.spacing.sm }}>
        {block.programmes.map((programme, index) => (
          <Card key={names[index]} style={{ minWidth: 0 }}>
            <Text style={{ ...fonts.bold, fontSize: 16 }}>{names[index]}</Text>
            {programme ? (
              <>
                <Text style={{ fontSize: 16, lineHeight: 24 }}>{programme.summary}</Text>
                {programme.measures.length ? (
                  <MoreText label="En savoir plus">
                    {programme.measures.map((measure) => (
                      <View key={measure.text} style={{ gap: 6 }}>
                        <Text style={{ fontSize: 15, lineHeight: 23 }}>{measure.text}</Text>
                        <SourceChip sources={measure.sources} subject={measure.text} />
                      </View>
                    ))}
                  </MoreText>
                ) : null}
              </>
            ) : (
              <Text style={{ color: colors.text.secondary }}>Pas de programme publié.</Text>
            )}
          </Card>
        ))}
      </View>
      {block.questions.length ? (
        <Accordion
          title={`Positions sur ${block.questions.length} affirmation${block.questions.length > 1 ? 's' : ''}`}
          headingLevel={3}
        >
          <View style={{ flexDirection: 'row', gap: effects.spacing.sm }}>
            <Text variant="caption" style={{ flex: 1 }}>
              {names[0]}
            </Text>
            <Text variant="caption" style={{ flex: 1 }}>
              {names[1]}
            </Text>
          </View>
          {block.questions.map(({ question, stances, same }) => (
            <View
              key={question.id}
              style={{
                gap: effects.spacing.xs,
                paddingTop: effects.spacing.xs,
                borderTopWidth: 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <Text style={{ fontSize: 15, lineHeight: 22 }}>
                {question.statement}
                {same ? (
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    {' · même position'}
                  </Text>
                ) : null}
              </Text>
              <View style={{ flexDirection: 'row', gap: effects.spacing.sm }}>
                {stances.map((stance, index) => (
                  <View key={names[index]} style={{ flex: 1, gap: effects.spacing.xxs }}>
                    <StanceBadge stance={stance?.stance ?? null} />
                    {stance?.sources.length ? (
                      <SourceChip compact sources={stance.sources} subject={question.statement} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Accordion>
      ) : null}
    </View>
  );
}

/**
 * « Comparer deux partis » (/partis/comparer). Aucune paire par défaut, aucun score ni nombre
 * d'accords. La paire vient de `?a=&b=`, lue après l'hydratation : le HTML statique est le même
 * pour tout le monde.
 */
export default function ComparePartiesScreen() {
  const vm = useViewModel(compareViewModel);
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const router = useRouter();
  const { colors, effects, fonts } = useTheme();
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const ids = vm.options.map((o) => o.id);

  useEffect(() => {
    if (ids.length === 0) return;
    const [fromA, fromB] = parseCompareParams({ a: params.a, b: params.b }, ids);
    setA(fromA);
    setB(fromB);
  }, [params.a, params.b, ids.length]);

  const choose = (nextA: string | null, nextB: string | null) => {
    setA(nextA);
    setB(nextB);
    router.setParams({ a: nextA ?? undefined, b: nextB ?? undefined });
  };

  const result = vm.compare(a, b);
  const names: [string, string] = result
    ? [displayName(result.parties[0]), displayName(result.parties[1])]
    : ['', ''];
  const themes = result
    ? result.themes.filter((t) => !themeFilter || t.theme.id === themeFilter)
    : [];

  const chip = (id: string | null, title: string) => {
    const active = themeFilter === id;
    return (
      <Pressable
        key={id ?? 'tous'}
        onPress={() => setThemeFilter(id)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          minHeight: 44,
          justifyContent: 'center',
          paddingHorizontal: 14,
          borderRadius: effects.borderRadius.round,
          borderWidth: 1.5,
          borderColor: active ? colors.tint : colors.surface.border.tertiary,
          backgroundColor: active ? colors.tintSoft : 'transparent',
        }}
      >
        <Text style={active ? { ...fonts.bold, color: colors.tint } : undefined}>{title}</Text>
      </Pressable>
    );
  };

  return (
    <Page
      meta={vm.meta}
      loading={vm.status !== 'loaded'}
      back={{ label: 'Partis', href: '/partis' }}
      template="hub"
    >
      <View style={{ gap: effects.spacing.md }}>
        <Text variant="title">Comparer deux partis</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.sm }}>
          <PartyPicker
            label="Premier parti"
            value={a}
            options={vm.options}
            blocked={b}
            onChange={(id) => choose(id, b)}
          />
          <PartyPicker
            label="Second parti"
            value={b}
            options={vm.options}
            blocked={a}
            onChange={(id) => choose(a, id)}
          />
        </View>

        {result ? (
          <>
            {/* Sous 768 px : une bande qui défile. Dès 768 px : toutes les puces, à la ligne, sans
                sujet caché hors de l'écran (la souris n'a pas de défilement horizontal). */}
            <Only below="md">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ margin: -effects.spacing.xs }}
                contentContainerStyle={{ gap: effects.spacing.xs, padding: effects.spacing.xs }}
              >
                {chip(null, 'Tous les sujets')}
                {result.themes.map((t) => chip(t.theme.id, t.theme.title.split(',')[0]))}
              </ScrollView>
            </Only>
            <Only
              from="md"
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
            >
              {chip(null, 'Tous les sujets')}
              {result.themes.map((t) => chip(t.theme.id, t.theme.title.split(',')[0]))}
            </Only>
            {themes.map((block) => (
              <ThemeBlock key={block.theme.id} block={block} names={names} />
            ))}
            <ReadingGuide anchor={GUIDE_ANCHORS.compare}>
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{COMPARE_GUIDE_TEXT}</Text>
            </ReadingGuide>
          </>
        ) : (
          <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
            Choisissez deux partis pour voir leur programme et leurs positions, thème par thème.
          </Text>
        )}
      </View>
    </Page>
  );
}
