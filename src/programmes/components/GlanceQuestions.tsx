import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceList } from '@/src/programmes/components/SourceChip';
import { STANCE_LABEL, StanceBadge } from '@/src/programmes/components/StanceBadge';
import { StanceColumnHead, StanceRow } from '@/src/programmes/components/StanceRow';
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
  const { colors, effects } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((item) => item.questionId === openId) ?? null;

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ gap: effects.spacing.xxs }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            columnGap: effects.spacing.sm,
          }}
        >
          <SectionTitle>Pour ou contre ?</SectionTitle>
          <TextLink href={positionsHref} size={15} standalone>
            {positionsLabel}
          </TextLink>
        </View>
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
        <StanceColumnHead
          left="Question"
          right="Position"
          paddingHorizontal={effects.spacing.md}
          ruled
        />
        {items.map((item, index) => (
          <View key={item.questionId} role="listitem">
            <Pressable
              ring="inside"
              onPress={() => setOpenId(item.questionId)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} : ${STANCE_LABEL[String(item.stance)]}. Ouvrir la justification et les sources.`}
              style={{
                minHeight: 56,
                justifyContent: 'center',
                paddingHorizontal: effects.spacing.md,
                paddingVertical: 12,
                borderTopWidth: index === 0 ? 0 : 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <StanceRow label={item.label} stance={item.stance} />
            </Pressable>
            <View
              style={{ paddingHorizontal: effects.spacing.md, paddingBottom: effects.spacing.sm }}
            >
              <TextLink href={item.compareHref} size={14} standalone>
                Comparer avec un autre parti
              </TextLink>
            </View>
          </View>
        ))}
      </View>
      <Sheet isOpen={!!open} onClose={() => setOpenId(null)} title={open?.label ?? ''}>
        {open ? (
          <>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
              {open.statement}
            </Text>
            <StanceBadge stance={open.stance} label="full" />
            <Text style={{ fontSize: 16, lineHeight: 24 }}>{open.justification}</Text>
            {open.sources.length ? <SourceList sources={open.sources} /> : null}
          </>
        ) : null}
      </Sheet>
    </View>
  );
}
