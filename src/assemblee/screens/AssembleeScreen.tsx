import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { DataSourceNote } from '@/src/assemblee/components/DataSourceNote';
import { ScrutinFilters } from '@/src/assemblee/components/ScrutinFilters';
import { t } from '@/src/assemblee/i18n/translate';
import {
  filtersToParams,
  parseFilterParams,
  type ListFilters,
} from '@/src/assemblee/models/filter-params';
import {
  assembleeListViewModel,
  type ScrutinRow,
} from '@/src/assemblee/view-models/assemblee-list.view-model';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';

const NO_FILTER: ListFilters = {
  categorie: 'toutes',
  resultat: 'tous',
  annee: null,
  recherche: '',
};
const URL_KEYS = ['categorie', 'resultat', 'annee', 'q'] as const;
const URL_DELAY = 250;

function Row({ row, first }: { row: ScrutinRow; first: boolean }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <Link href={row.href as never} asChild>
      <Pressable
        large
        accessibilityRole="link"
        style={{
          gap: 4,
          paddingHorizontal: effects.spacing.md,
          paddingVertical: 12,
          borderTopWidth: first ? 0 : 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.text.secondary }}>
          {`${row.date} · ${row.categorie}`}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 23 }}>{row.titre}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon
              name={row.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
              variant="secondary"
              size="small"
            />
            <Text style={{ ...fonts.bold, fontSize: 14 }}>{row.resultat}</Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>{row.decompte}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

/**
 * `/assemblee` : les grands votes de la 17e législature, du plus récent au plus ancien, par mois.
 * Le HTML pré-rendu est la liste entière ; les filtres viennent de l'adresse, lue après
 * l'hydratation (comme `/partis/comparer`).
 */
export default function AssembleeScreen() {
  const vm = useViewModel(assembleeListViewModel);
  const params = useLocalSearchParams<Record<(typeof URL_KEYS)[number], string>>();
  const router = useRouter();
  const { colors, effects } = useTheme();
  const [filters, setFilters] = useState<ListFilters>(NO_FILTER);
  const written = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adresse → filtres, sauf s'il s'agit de l'écho de ce qui vient d'y être écrit (le curseur ne saute pas).
  useEffect(() => {
    const fromUrl = parseFilterParams(params);
    if (JSON.stringify(filtersToParams(fromUrl)) === written.current) return;
    setFilters(fromUrl);
  }, [params.categorie, params.resultat, params.annee, params.q]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const change = (next: ListFilters) => {
    setFilters(next);
    const query = filtersToParams({ ...next, recherche: next.recherche.trim() });
    written.current = JSON.stringify(query);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.setParams(
        Object.fromEntries(URL_KEYS.map((key) => [key, query[key]])) as Record<string, string>
      );
    }, URL_DELAY);
  };

  const { months, count, total } = vm.list(filters);
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
      back={{ label: t('common.back'), href: '/comprendre' }}
    >
      <View style={{ gap: 6 }}>
        <Text variant="title">{t('list.title')}</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>{t('list.lead')}</Text>
      </View>

      <View
        role="note"
        style={{
          gap: effects.spacing.xs,
          padding: effects.spacing.md,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.tintSoft,
        }}
      >
        <Text style={{ fontSize: 16, lineHeight: 24 }}>{vm.warning}</Text>
      </View>

      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="caption" headingLevel={2}>
          {t('list.criteriaTitle')}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{t('list.criteria')}</Text>
        <TextLink href="/methodologie#votes-assemblee" standalone>
          {t('list.methodLink')}
        </TextLink>
        <TextLink href={vm.officialListUrl} standalone>
          {t('common.officialListLink')}
        </TextLink>
      </View>

      <ScrutinFilters
        filters={filters}
        onChange={change}
        categories={vm.categories}
        years={vm.years}
      />

      <Text aria-live="polite" style={{ fontSize: 14, color: colors.text.secondary }}>
        {t('list.count', { count, total })}
      </Text>

      {months.length === 0 ? (
        <Text style={{ fontSize: 16, color: colors.text.secondary }}>{t('list.empty')}</Text>
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

      {vm.source ? <DataSourceNote source={vm.source} /> : null}
    </Page>
  );
}
