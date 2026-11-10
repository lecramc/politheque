import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextInput } from '@/components/ui/TextInput';
import { t } from '@/src/assemblee/i18n/translate';
import type { ListFilters } from '@/src/assemblee/models/filter-params';
import type { ScrutinCategory } from '@/src/assemblee/models/scrutin.model';

/**
 * Filtres de la liste : catégorie, résultat, année, titre. L'état vit dans l'adresse
 * (`?categorie=&resultat=&annee=&q=`) : un lien filtré se partage.
 */
export function ScrutinFilters({
  filters,
  onChange,
  categories,
  years,
}: {
  filters: ListFilters;
  onChange: (next: ListFilters) => void;
  categories: { id: ScrutinCategory; label: string }[];
  years: string[];
}) {
  const { colors, effects, fonts } = useTheme();
  const active =
    filters.categorie !== 'toutes' ||
    filters.resultat !== 'tous' ||
    filters.annee !== null ||
    filters.recherche !== '';

  const chip = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1.5,
        borderColor: selected ? colors.tint : colors.surface.border.tertiary,
        backgroundColor: selected ? colors.tintSoft : 'transparent',
      }}
    >
      <Text style={selected ? { ...fonts.bold, color: colors.tint } : undefined}>{label}</Text>
    </Pressable>
  );

  const group = (label: string, chips: React.ReactNode) => (
    <View role="group" aria-label={label} style={{ gap: effects.spacing.xs }}>
      <Text variant="label">{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}>
        {chips}
      </View>
    </View>
  );

  return (
    <View role="group" aria-label={t('list.filters.title')} style={{ gap: effects.spacing.md }}>
      <TextInput
        variant="primary"
        label={t('list.filters.search')}
        placeholder={t('list.filters.searchPlaceholder')}
        value={filters.recherche}
        onChangeText={(recherche) => onChange({ ...filters, recherche })}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={t('list.filters.search')}
      />
      {group(
        t('list.filters.category'),
        <>
          {chip('toutes', t('list.filters.allCategories'), filters.categorie === 'toutes', () =>
            onChange({ ...filters, categorie: 'toutes' })
          )}
          {categories.map((c) =>
            chip(c.id, c.label, filters.categorie === c.id, () =>
              onChange({ ...filters, categorie: filters.categorie === c.id ? 'toutes' : c.id })
            )
          )}
        </>
      )}
      {group(
        t('list.filters.result'),
        <>
          {chip('tous', t('list.filters.allResults'), filters.resultat === 'tous', () =>
            onChange({ ...filters, resultat: 'tous' })
          )}
          {chip('adopte', t('result.adopte'), filters.resultat === 'adopte', () =>
            onChange({ ...filters, resultat: filters.resultat === 'adopte' ? 'tous' : 'adopte' })
          )}
          {chip('rejete', t('result.rejete'), filters.resultat === 'rejete', () =>
            onChange({ ...filters, resultat: filters.resultat === 'rejete' ? 'tous' : 'rejete' })
          )}
        </>
      )}
      {group(
        t('list.filters.period'),
        <>
          {chip('toutes', t('list.filters.allPeriods'), filters.annee === null, () =>
            onChange({ ...filters, annee: null })
          )}
          {years.map((year) =>
            chip(year, year, filters.annee === year, () =>
              onChange({ ...filters, annee: filters.annee === year ? null : year })
            )
          )}
        </>
      )}
      {active ? (
        <Pressable
          onPress={() =>
            onChange({ categorie: 'toutes', resultat: 'tous', annee: null, recherche: '' })
          }
          accessibilityRole="button"
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
            {t('list.filters.reset')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
