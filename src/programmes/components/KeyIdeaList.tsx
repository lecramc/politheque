import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Card } from '@/src/programmes/components/Card';
import { useIsDesktop } from '@/src/programmes/components/Page';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceList } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import type { PartyViewModel } from '@/src/programmes/view-models/party.view-model';

type KeyIdeas = NonNullable<PartyViewModel['keyIdeas']>;
type KeyIdeaItem = KeyIdeas['items'][number];

/** « Ce qu'il propose » : 4 idées dans l'ordre des thèmes du site, sans numéro ni classement. */
export function KeyIdeaList({ keyIdeas, partyName }: { keyIdeas: KeyIdeas; partyName: string }) {
  const { colors, effects, fonts } = useTheme();
  const isDesktop = useIsDesktop();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = keyIdeas.items.find((item) => item.id === openId) ?? null;

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ gap: 4 }}>
        <SectionTitle>Ce qu'il propose</SectionTitle>
        {keyIdeas.programmeLine ? (
          <Text style={{ fontSize: 16, color: colors.text.secondary }}>
            {keyIdeas.programmeLine}
          </Text>
        ) : null}
      </View>
      <View
        role="list"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: effects.spacing.sm,
        }}
      >
        {keyIdeas.items.map((item) => (
          <View
            key={item.id}
            role="listitem"
            style={{ width: isDesktop ? '48.8%' : '100%', flexGrow: 1 }}
          >
            <Card style={{ gap: 8, flex: 1 }}>
              <Text style={{ ...fonts.bold, fontSize: 15, color: colors.tint }}>
                {item.themeTitle}
              </Text>
              <Text
                variant="title"
                headingLevel={3}
                style={{ fontSize: 22, lineHeight: 28, color: colors.text.strong }}
              >
                {item.title}
              </Text>
              <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.text}</Text>
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}
              >
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>{item.origin} ·</Text>
                <Pressable
                  onPress={() => setOpenId(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.sourceCountLabel} : ${item.title}. Ouvrir la liste des sources.`}
                  hitSlop={8}
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text
                    style={{
                      ...fonts.regular,
                      fontSize: 14,
                      color: colors.tint,
                      textDecorationLine: 'underline',
                    }}
                  >
                    {item.sourceCountLabel}
                  </Text>
                </Pressable>
              </View>
            </Card>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 14, color: colors.text.secondary }}>
        Les mots entre guillemets sont ceux du parti.{' '}
        <Link
          href="/methodologie"
          style={{ ...fonts.bold, color: colors.tint, textDecorationLine: 'underline' }}
        >
          Comment ces 4 idées sont choisies
        </Link>
      </Text>
      <Sheet isOpen={!!open} onClose={() => setOpenId(null)} title={open?.title ?? ''}>
        {open ? <IdeaSheetBody item={open} partyName={partyName} /> : null}
      </Sheet>
    </View>
  );
}

function IdeaSheetBody({ item, partyName }: { item: KeyIdeaItem; partyName: string }) {
  const { colors, effects, fonts } = useTheme();
  return (
    <>
      <Text style={{ ...fonts.bold, fontSize: 15, color: colors.tint }}>
        {item.themeTitle} · {partyName}
      </Text>
      <Text style={{ ...fonts.bold, fontSize: 16, color: colors.text.secondary }}>
        {item.sourceCountLabel}
      </Text>
      <SourceList sources={item.sources} />
      {item.relatedStances.length ? (
        <>
          <Text style={{ ...fonts.bold, fontSize: 16, color: colors.text.secondary }}>
            Ses réponses aux questions liées
          </Text>
          <View
            style={{
              borderRadius: effects.borderRadius.small,
              borderWidth: 1,
              borderColor: colors.surface.border.primary,
              backgroundColor: colors.surface.primary,
            }}
          >
            {item.relatedStances.map((related, index) => (
              <View
                key={related.questionId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: effects.spacing.sm,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: colors.surface.border.primary,
                }}
              >
                <Text style={{ flex: 1, fontSize: 16 }}>{related.label}</Text>
                <StanceBadge stance={related.stance} />
              </View>
            ))}
          </View>
        </>
      ) : null}
    </>
  );
}
