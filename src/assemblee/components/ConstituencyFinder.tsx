import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextInput } from '@/components/ui/TextInput';
import { ChoiceRow } from '@/src/assemblee/components/ChoiceRow';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { departementChoices } from '@/src/assemblee/models/constituencies';
import type { CirconscriptionRow } from '@/src/assemblee/models/constituencies';
import { ExternalLink } from '@/src/programmes/components/ExternalLink';

export type Constituency = {
  choices: (query: string, requested: boolean) => ReturnType<typeof departementChoices>;
  circonscriptions: (code: string) => CirconscriptionRow[];
};

/**
 * « Trouver mon député » : on choisit son département (en tapant son nom ou son numéro, ou dans la
 * liste), puis on voit les circonscriptions et le député en exercice de chacune. Un clic sur un
 * député renvoie à sa ligne dans le tableau des votes. Aucune adresse n'est demandée, rien n'est
 * envoyé : la recherche se fait dans les données déjà chargées.
 */
export function ConstituencyFinder({
  constituency,
  onPick,
}: {
  constituency: Constituency;
  /** Sans `onPick` (page de la liste), le nom du député est affiché sans lien. */
  onPick?: (deputeId: string) => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const [query, setQuery] = useState('');
  const [requested, setRequested] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const choices = constituency.choices(query, requested);
  const chosen = code === null ? null : constituency.choices(code, false).items[0];
  const rows = code === null ? [] : constituency.circonscriptions(code);
  const linkStyle = { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' } as const;

  return (
    <View
      style={{
        gap: effects.spacing.sm,
        padding: effects.spacing.md,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        borderRadius: effects.borderRadius.small,
        backgroundColor: colors.surface.primary,
      }}
    >
      <Text variant="label">{COPY.constituency.title}</Text>
      <TextInput
        variant="primary"
        label={COPY.constituency.search}
        placeholder={COPY.constituency.searchPlaceholder}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setCode(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={COPY.constituency.search}
      />

      {code === null ? (
        choices.visible ? (
          choices.items.length === 0 ? (
            <Text aria-live="polite" style={{ color: colors.text.secondary }}>
              {COPY.constituency.none}
            </Text>
          ) : (
            <View
              role="list"
              aria-label={COPY.constituency.listLabel}
              style={{ gap: effects.spacing.xs }}
            >
              {choices.items.map((item) => (
                <ChoiceRow
                  key={item.code}
                  label={item.label}
                  selected={false}
                  onPress={() => setCode(item.code)}
                />
              ))}
            </View>
          )
        ) : (
          <Pressable
            onPress={() => setRequested(true)}
            accessibilityRole="button"
            style={linkStyle}
          >
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {choices.showAllLabel}
            </Text>
          </Pressable>
        )
      ) : (
        <View style={{ gap: effects.spacing.xs }}>
          {chosen ? <Text style={{ ...fonts.semibold }}>{chosen.label}</Text> : null}
          <View role="list" aria-label={COPY.constituency.title}>
            {rows.map((row, i) => (
              <View
                key={row.numero}
                role="listitem"
                style={{
                  gap: effects.spacing.xxs,
                  paddingVertical: effects.spacing.xs,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderColor: colors.surface.border.primary,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>{row.label}</Text>
                {row.deputeId && !onPick ? (
                  <Text style={{ ...fonts.semibold }}>{row.nom}</Text>
                ) : row.deputeId && onPick ? (
                  <Pressable
                    onPress={() => onPick(row.deputeId!)}
                    accessibilityRole="button"
                    style={linkStyle}
                  >
                    <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
                      {row.nom}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: colors.text.secondary }}>{COPY.constituency.vacant}</Text>
                )}
              </View>
            ))}
          </View>
          <Pressable onPress={() => setCode(null)} accessibilityRole="button" style={linkStyle}>
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {COPY.constituency.change}
            </Text>
          </Pressable>
        </View>
      )}

      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {COPY.constituency.help}{' '}
        <ExternalLink href={COPY.constituency.helpUrl}>{COPY.constituency.helpLink}</ExternalLink>
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: colors.text.secondary }}>
        {COPY.constituency.privacy}
      </Text>
    </View>
  );
}
