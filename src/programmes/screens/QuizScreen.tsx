import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cssEasing, duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Arc } from '@/src/programmes/components/Arc';
import { Page } from '@/src/programmes/components/Page';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import { quizViewModel } from '@/src/programmes/view-models/quiz.view-model';

const SYMBOL: Record<string, string> = { '2': '++', '1': '+', '0': '=', '-1': '−', '-2': '−−' };

export default function QuizScreen() {
  const vm = useViewModel(quizViewModel);
  const { colors, effects, fonts } = useTheme();
  const { ms } = useMotion();
  const opinions = vm.choices.filter((c) => c.value !== null);

  // Retour visuel immédiat sur la réponse, puis avance automatique (~250 ms).
  const [pending, setPending] = useState<{ value: AnswerValue } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const direction = useRef<'fromRight' | 'fromLeft'>('fromRight');
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const cancelPending = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPending(null);
  };
  // La réponse est enregistrée tout de suite ; seule l'avance est différée.
  const choose = (value: AnswerValue) => {
    if (pending) return;
    vm.record(value);
    setPending({ value });
    direction.current = 'fromRight';
    timer.current = setTimeout(() => {
      timer.current = null;
      setPending(null);
      vm.next();
    }, duration.choiceFeedback);
  };
  const back = () => {
    cancelPending();
    direction.current = 'fromLeft';
    vm.back();
  };
  const showResults = () => {
    cancelPending();
    vm.showResults();
  };
  const selectedValue = pending ? pending.value : vm.selectedValue;
  const transition = {
    transitionProperty: ['width', 'backgroundColor'] as ('width' | 'backgroundColor')[],
    transitionDuration: ms(duration.open),
    transitionTimingFunction: cssEasing.inOut,
  };

  return (
    <Page title={'Me situer'} loading={!vm.ready} focus back={{ label: 'Quitter', href: '/' }}>
      {vm.question ? (
        <View style={{ gap: effects.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Arc
              value={(vm.index + 1) / vm.total}
              size={84}
              strokeWidth={9}
              accessibilityLabel={`Question ${vm.index + 1} sur ${vm.total}`}
            >
              <Text style={{ ...fonts.displayBold, fontSize: 17, color: colors.tint }}>
                {vm.index + 1}/{vm.total}
              </Text>
            </Arc>
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="caption">{vm.themeTitle}</Text>
              <View style={{ flexDirection: 'row', gap: 5 }} accessibilityElementsHidden>
                {Array.from({ length: vm.themeCount }, (_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      width: i === vm.themeIndex ? 18 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: i <= vm.themeIndex ? colors.tint : colors.tintSoft,
                      ...transition,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>

          <Enter
            key={vm.question.id}
            kind={direction.current}
            duration={duration.question}
            reducedFade
            style={{ gap: effects.spacing.md }}
          >
            <Text variant="title" style={{ fontSize: 25, lineHeight: 32 }}>
              {vm.question.statement}
            </Text>

            <Accordion title="Besoin d'un coup de pouce ?">
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.question.help}</Text>
            </Accordion>

            <View style={{ gap: 10 }} accessibilityRole="radiogroup">
              {opinions.map((choice) => {
                const selected = selectedValue === choice.value;
                return (
                  <Pressable
                    key={String(choice.value)}
                    haptic
                    onPress={() => choose(choice.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      minHeight: 56,
                      paddingHorizontal: 14,
                      borderRadius: effects.borderRadius.small,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.tint : colors.surface.border.tertiary,
                      backgroundColor: selected ? colors.tintSoft : colors.surface.primary,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 30,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: colors.tint,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? colors.tint : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          ...fonts.bold,
                          color: selected ? colors.text.onColor : colors.tint,
                        }}
                      >
                        {SYMBOL[String(choice.value)]}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 17, ...(selected ? fonts.bold : fonts.regular) }}>
                      {choice.label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                haptic
                onPress={() => choose(null)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedValue === null }}
                aria-checked={selectedValue === null}
                style={{
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: effects.borderRadius.small,
                }}
              >
                <Text
                  style={{
                    color: colors.tint,
                    textDecorationLine: 'underline',
                    fontSize: 16,
                    ...(selectedValue === null ? fonts.bold : null),
                  }}
                >
                  Je ne sais pas / pas d'avis
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={vm.toggleImportant}
              accessibilityRole="switch"
              accessibilityState={{ checked: vm.important }}
              aria-checked={vm.important}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                padding: 14,
                borderRadius: effects.borderRadius.small,
                backgroundColor: colors.surface.primary,
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ ...fonts.bold, fontSize: 16 }}>Ce sujet compte double</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                  Pour les sujets qui vous tiennent le plus à cœur
                </Text>
              </View>
              <Animated.View
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  padding: 3,
                  backgroundColor: vm.important ? colors.tint : colors.surface.border.secondary,
                  transitionProperty: 'backgroundColor',
                  transitionDuration: ms(duration.open),
                }}
              >
                <Animated.View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: vm.important ? 20 : 0 }],
                    transitionProperty: 'transform',
                    transitionDuration: ms(duration.open),
                    transitionTimingFunction: cssEasing.inOut,
                  }}
                />
              </Animated.View>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              {vm.canGoBack ? (
                <Pressable onPress={back} style={{ minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ color: colors.tint, ...fonts.bold }}>‹ Précédente</Text>
                </Pressable>
              ) : (
                <View />
              )}
              {vm.answeredCount > 0 ? (
                <Pressable
                  onPress={showResults}
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text style={{ color: colors.tint }}>Voir mes résultats →</Text>
                </Pressable>
              ) : null}
            </View>
          </Enter>
        </View>
      ) : null}
    </Page>
  );
}
