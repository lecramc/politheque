import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Article493Note } from '@/src/assemblee/components/Article493Note';
import { AssembleeOverview } from '@/src/assemblee/components/AssembleeOverview';
import {
  ConstituencyFinder,
  type Constituency,
} from '@/src/assemblee/components/ConstituencyFinder';
import { DataSourceNote } from '@/src/assemblee/components/DataSourceNote';
import { ScrutinFilters } from '@/src/assemblee/components/ScrutinFilters';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import {
  filtersToParams,
  parseFilterParams,
  type ListFilters,
} from '@/src/assemblee/models/filter-params';
import {
  assembleeListViewModel,
  LIST_PAGE_SIZE,
  type ScrutinRow,
} from '@/src/assemblee/view-models/assemblee-list.view-model';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { ExternalLink } from '@/src/programmes/components/ExternalLink';
import { Page } from '@/src/programmes/components/Page';

const NO_FILTER: ListFilters = {
  categorie: 'toutes',
  resultat: 'tous',
  annee: null,
  recherche: '',
};
const URL_KEYS = ['categorie', 'resultat', 'annee', 'q'] as const;
const URL_DELAY = 250;

/** « Chercher mon député » : replié ; l'annuaire des députés n'est chargé qu'à l'ouverture. */
function DeputyFinder({
  constituency,
  onOpen,
}: {
  constituency: Constituency | null;
  onOpen: () => void;
}) {
  const { colors, effects } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: effects.spacing.xs }}>
      <Pressable
        onPress={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          minHeight: 48,
          justifyContent: 'center',
          paddingHorizontal: effects.spacing.md,
          borderWidth: 1,
          borderColor: colors.tintBorder,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.tintSoft,
        }}
      >
        <Text style={{ color: colors.tint, fontSize: 16 }}>
          {open ? COPY.constituency.close : COPY.constituency.open}
        </Text>
      </Pressable>
      {open ? (
        constituency ? (
          <ConstituencyFinder constituency={constituency} />
        ) : (
          <Text aria-live="polite" style={{ color: colors.text.secondary }}>
            {COPY.constituency.loading}
          </Text>
        )
      ) : null}
    </View>
  );
}

function Row({ row, first }: { row: ScrutinRow; first: boolean }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Link href={row.href as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          gap: effects.spacing.xxs,
          paddingHorizontal: effects.spacing.md,
          paddingVertical: effects.spacing.sm,
          borderTopWidth: first ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.text.secondary }}>
          {`${row.date} · ${row.categorie}`}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 23 }}>{row.titre}</Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: effects.spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xxs }}>
            <Icon
              name={row.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
              variant="secondary"
              size="small"
            />
            <Text style={{ ...fonts.bold, fontSize: 14 }}>{row.resultat}</Text>
          </View>
          <Text plainDigits style={{ fontSize: 14, color: colors.text.secondary }}>
            {row.decompte}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.text.secondary }}>{row.reference}</Text>
      </Pressable>
    </Link>
  );
}

/**
 * `/assemblee` : les votes depuis 2024, du plus récent au plus ancien, par mois, vingt à la fois.
 * Le HTML pré-rendu ne contient que les vingt premiers ; les filtres viennent de l'adresse, lue
 * après l'hydratation (comme `/partis/comparer`), et s'appliquent à toute la liste.
 */
export default function AssembleeScreen() {
  const vm = useViewModel(assembleeListViewModel);
  const params = useLocalSearchParams<Record<(typeof URL_KEYS)[number], string>>();
  const router = useRouter();
  const { colors, effects, fonts } = useTheme();
  const [filters, setFilters] = useState<ListFilters>(NO_FILTER);
  const [limit, setLimit] = useState(LIST_PAGE_SIZE);
  const written = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adresse → filtres, sauf s'il s'agit de l'écho de ce qui vient d'y être écrit (le curseur ne saute pas).
  useEffect(() => {
    const fromUrl = parseFilterParams(params);
    if (JSON.stringify(filtersToParams(fromUrl)) === written.current) return;
    setFilters(fromUrl);
    setLimit(LIST_PAGE_SIZE);
  }, [params.categorie, params.resultat, params.annee, params.q]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const change = (next: ListFilters) => {
    setFilters(next);
    setLimit(LIST_PAGE_SIZE);
    const query = filtersToParams({ ...next, recherche: next.recherche.trim() });
    written.current = JSON.stringify(query);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.setParams(
        Object.fromEntries(URL_KEYS.map((key) => [key, query[key]])) as Record<string, string>
      );
    }, URL_DELAY);
  };

  const { months, countLabel, moreLabel } = vm.list(filters, limit);
  const card = {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border.primary,
    borderRadius: effects.borderRadius.small,
    overflow: 'hidden' as const,
  };

  return (
    <Page
      meta={vm.meta}
      loading={vm.status !== 'loaded'}
      back={{ label: COPY.common.back, href: '/comprendre' }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="title">{COPY.list.title}</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>{vm.lead}</Text>
      </View>

      <DeputyFinder constituency={vm.constituency} onOpen={vm.loadDeputes} />

      <View
        role="note"
        aria-label={vm.words.title}
        style={{
          gap: effects.spacing.xs,
          padding: effects.spacing.sm,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.surface.secondary,
        }}
      >
        <Text variant="label" headingLevel={2}>
          {vm.words.title}
        </Text>
        {vm.words.terms.map((word) => (
          <Text key={word.term} style={{ fontSize: 15, lineHeight: 22 }}>
            <Text style={{ ...fonts.bold, fontSize: 15, lineHeight: 22 }}>{`${word.term} : `}</Text>
            {word.definition} <TextLink href={word.href as never}>{vm.words.moreLabel}</TextLink>
          </Text>
        ))}
      </View>

      <AssembleeOverview />

      <View
        role="note"
        style={{
          padding: effects.spacing.sm,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.tintSoft,
        }}
      >
        <Text style={{ fontSize: 15, lineHeight: 22 }}>{vm.warning}</Text>
      </View>

      <Accordion title={vm.criteria.title} headingLevel={2}>
        <View style={{ gap: effects.spacing.xs }}>
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.criteria.lead}</Text>
          {vm.criteria.rules.map((rule) => (
            <Text
              key={rule}
              style={{ fontSize: 16, lineHeight: 25, paddingLeft: effects.spacing.xs }}
            >
              {`• ${rule}`}
            </Text>
          ))}
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.criteria.excluded}</Text>
          <Article493Note note={vm.article493} />
          <TextLink href="/methodologie#votes-assemblee" standalone>
            {COPY.list.methodLink}
          </TextLink>
          <ExternalLink href={vm.officialListUrl} standalone>
            {COPY.common.officialListLink}
          </ExternalLink>
        </View>
      </Accordion>

      <ScrutinFilters
        filters={filters}
        onChange={change}
        categories={vm.categories}
        years={vm.years}
        button={vm.filterButton(filters)}
      />

      <Text aria-live="polite" style={{ fontSize: 14, color: colors.text.secondary }}>
        {countLabel}
      </Text>

      {months.length === 0 ? (
        <Text style={{ fontSize: 16, color: colors.text.secondary }}>{COPY.list.empty}</Text>
      ) : (
        months.map((month) => (
          <View key={month.mois} style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              {month.libelle}
            </Text>
            <View style={card}>
              {month.rows.map((row, index) => (
                <Row key={row.numero} row={row} first={index === 0} />
              ))}
            </View>
          </View>
        ))
      )}

      {moreLabel ? (
        <Button variant="secondary" onPress={() => setLimit(limit + LIST_PAGE_SIZE)}>
          {moreLabel}
        </Button>
      ) : null}

      {vm.source ? <DataSourceNote source={vm.source} /> : null}
    </Page>
  );
}
