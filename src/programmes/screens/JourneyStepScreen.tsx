import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Page } from '@/src/programmes/components/Page';
import { StepHeader } from '@/src/programmes/components/StepHeader';
import { StepInvite } from '@/src/programmes/components/StepInvite';
import { StepItemRow } from '@/src/programmes/components/StepItemRow';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';
import { journeyStepViewModel } from '@/src/programmes/view-models/journey-step.view-model';

/** Page d'une étape : ses contenus, leur état, et la suite (jamais verrouillée). */
export default function JourneyStepScreen() {
  const { etape } = useLocalSearchParams<{ etape: string }>();
  const vm = useViewModel(journeyStepViewModel(etape));
  const { colors, effects, fonts } = useTheme();
  const back = { label: JOURNEY_COPY.back, href: '/' };

  if (vm.status === 'loaded' && !vm.found) {
    return (
      <Page title={JOURNEY_COPY.stepNotFound} back={back}>
        <Text variant="title">{JOURNEY_COPY.stepNotFound}</Text>
      </Page>
    );
  }

  return (
    <Page title={vm.title || undefined} loading={vm.status !== 'loaded'} back={back}>
      <StepHeader
        index={vm.index}
        total={vm.total}
        title={vm.title}
        intro={vm.intro}
        ratio={vm.ratio}
        readCount={vm.readCount}
        itemTotal={vm.itemTotal}
      />
      {vm.invite ? <StepInvite text={vm.invite} /> : null}
      {vm.notice ? <StepInvite text={vm.notice} /> : null}
      <View style={{ gap: effects.spacing.xs }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Text style={{ ...fonts.display, fontSize: 20 }}>{vm.listTitle}</Text>
          {vm.orderNote ? (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{vm.orderNote}</Text>
          ) : null}
        </View>
        <View
          role="list"
          style={{
            backgroundColor: colors.surface.primary,
            borderWidth: 1,
            borderColor: colors.surface.border.primary,
            borderRadius: effects.borderRadius.small,
            overflow: 'hidden',
          }}
        >
          {vm.items.map((item, index) => (
            <View key={item.key} role="listitem">
              <StepItemRow item={item} last={index === vm.items.length - 1} />
            </View>
          ))}
        </View>
      </View>
      {vm.nextItem ? (
        <Link href={vm.nextItem.href as never} asChild>
          <Pressable
            large
            accessibilityRole="link"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 54,
              padding: effects.spacing.sm,
              borderRadius: effects.borderRadius.small,
              borderWidth: 1.5,
              borderColor: colors.surface.border.tertiary,
              backgroundColor: colors.surface.primary,
            }}
          >
            <Text style={{ ...fonts.bold, textAlign: 'center' }}>{vm.nextItem.label}</Text>
          </Pressable>
        </Link>
      ) : null}
      <Text style={{ color: colors.text.secondary, textAlign: 'center', fontSize: 14 }}>
        {vm.footnote}
      </Text>
    </Page>
  );
}
