import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceList } from '@/src/programmes/components/SourceChip';
import { STANCE_LABEL, StanceBadge } from '@/src/programmes/components/StanceBadge';
import type { PartyViewModel } from '@/src/programmes/view-models/party.view-model';

type GlanceItem = PartyViewModel['glance'][number];

/** « Pour ou contre ? » : les mêmes questions pour les dix partis ; une ligne ouvre la justification. */
export function GlanceQuestions({
  items,
  intro,
  positionsLabel,
  positionsHref,
}: {
  items: GlanceItem[];
  intro: string;
  positionsLabel: string;
  positionsHref: string;
}) {
  const { colors, effects, fonts } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((item) => item.questionId === openId) ?? null;

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ gap: 4 }}>
        <SectionTitle>Pour ou contre ?</SectionTitle>
        <Text style={{ fontSize: 16, color: colors.text.secondary }}>{intro}</Text>
      </View>
      <View
        role="list"
        style={{
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          backgroundColor: colors.surface.primary,
          overflow: 'hidden',
        }}
      >
        {items.map((item, index) => (
          <View key={item.questionId} role="listitem">
            <Pressable
              onPress={() => setOpenId(item.questionId)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} : ${STANCE_LABEL[String(item.stance)]}. Ouvrir la justification et les sources.`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                minHeight: 56,
                paddingHorizontal: effects.spacing.md,
                paddingVertical: 12,
                borderTopWidth: index === 0 ? 0 : 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <Text style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>{item.label}</Text>
              <StanceBadge stance={item.stance} />
            </Pressable>
          </View>
        ))}
      </View>
      <Link href={positionsHref as never} asChild>
        <Pressable
          accessibilityRole="link"
          style={{
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: effects.spacing.md,
            borderRadius: effects.borderRadius.small,
            borderWidth: 1.5,
            borderColor: colors.text.secondary,
            backgroundColor: colors.surface.primary,
          }}
        >
          <Text style={{ ...fonts.bold, fontSize: 16, textAlign: 'center' }}>{positionsLabel}</Text>
        </Pressable>
      </Link>
      <Sheet isOpen={!!open} onClose={() => setOpenId(null)} title={open?.label ?? ''}>
        {open ? (
          <>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
              {open.statement}
            </Text>
            <StanceBadge stance={open.stance} />
            <Text style={{ fontSize: 16, lineHeight: 24 }}>{open.justification}</Text>
            {open.sources.length ? <SourceList sources={open.sources} /> : null}
          </>
        ) : null}
      </Sheet>
    </View>
  );
}
