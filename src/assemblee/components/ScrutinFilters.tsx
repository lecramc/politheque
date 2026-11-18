import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextInput } from '@/components/ui/TextInput';
import { ChoiceRow } from '@/src/assemblee/components/ChoiceRow';
import { FilterButton } from '@/src/assemblee/components/FilterButton';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { ListFilters } from '@/src/assemblee/models/filter-params';
import type { ScrutinCategory } from '@/src/assemblee/models/scrutin.model';
import { Sheet } from '@/src/programmes/components/Sheet';

const NO_FILTER = { categorie: 'toutes', resultat: 'tous', annee: null } as const;

/**
 * Filtres de la liste, sur une seule ligne : le champ de recherche et un bouton « Filtrer » (ou
 * « Filtrer · 2 ») qui ouvre une feuille : type de vote (avec une ligne d'aide chacun), résultat,
 * période. L'état vit dans l'adresse (`?categorie=&resultat=&annee=&q=`) : un lien filtré se partage.
 */
export function ScrutinFilters({
  filters,
  onChange,
  categories,
  years,
  button,
}: {
  filters: ListFilters;
  onChange: (next: ListFilters) => void;
  categories: { id: ScrutinCategory; label: string; help: string }[];
  years: string[];
  button: { label: string; active: boolean };
}) {
  const { colors, effects } = useTheme();
  const [open, setOpen] = useState(false);

  const group = (label: string, choices: React.ReactNode) => (
    <View role="radiogroup" aria-label={label} style={{ gap: effects.spacing.xs }}>
      <Text variant="label">{label}</Text>
      {choices}
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}>
      <View style={{ flex: 1 }}>
        <TextInput
          variant="primary"
          placeholder={COPY.list.filters.searchPlaceholder}
          value={filters.recherche}
          onChangeText={(recherche) => onChange({ ...filters, recherche })}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={COPY.list.filters.search}
          leftIcon="search-outline"
        />
      </View>
      <FilterButton label={button.label} active={button.active} onPress={() => setOpen(true)} />

      <Sheet isOpen={open} onClose={() => setOpen(false)} title={COPY.list.filters.title}>
        {group(
          COPY.list.filters.category,
          <>
            <ChoiceRow
              label={COPY.list.filters.allCategories}
              selected={filters.categorie === 'toutes'}
              onPress={() => onChange({ ...filters, categorie: 'toutes' })}
            />
            {categories.map((c) => (
              <ChoiceRow
                key={c.id}
                label={c.label}
                help={c.help}
                selected={filters.categorie === c.id}
                onPress={() => onChange({ ...filters, categorie: c.id })}
              />
            ))}
          </>
        )}
        {group(
          COPY.list.filters.result,
          <>
            <ChoiceRow
              label={COPY.list.filters.allResults}
              selected={filters.resultat === 'tous'}
              onPress={() => onChange({ ...filters, resultat: 'tous' })}
            />
            <ChoiceRow
              label={COPY.result.adopte}
              selected={filters.resultat === 'adopte'}
              onPress={() => onChange({ ...filters, resultat: 'adopte' })}
            />
            <ChoiceRow
              label={COPY.result.rejete}
              selected={filters.resultat === 'rejete'}
              onPress={() => onChange({ ...filters, resultat: 'rejete' })}
            />
          </>
        )}
        {group(
          COPY.list.filters.period,
          <>
            <ChoiceRow
              label={COPY.list.filters.allPeriods}
              selected={filters.annee === null}
              onPress={() => onChange({ ...filters, annee: null })}
            />
            {years.map((year) => (
              <ChoiceRow
                key={year}
                label={year}
                selected={filters.annee === year}
                onPress={() => onChange({ ...filters, annee: year })}
              />
            ))}
          </>
        )}
        {button.active ? (
          <Pressable
            onPress={() => onChange({ ...filters, ...NO_FILTER })}
            accessibilityRole="button"
            style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {COPY.list.filters.reset}
            </Text>
          </Pressable>
        ) : null}
      </Sheet>
    </View>
  );
}
