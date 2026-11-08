import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cssEasing, duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { radioKeyAction } from '@/src/core/web/radio-keys';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Arc } from '@/src/programmes/components/Arc';
import { Card } from '@/src/programmes/components/Card';
import { Page } from '@/src/programmes/components/Page';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import { quizMeta } from '@/src/programmes/models/seo/page-meta';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';
import { quizViewModel } from '@/src/programmes/view-models/quiz.view-model';

const SYMBOL: Record<string, string> = { '2': '++', '1': '+', '0': '=', '-1': '−', '-2': '−−' };

const metaViewModel = pageMetaViewModel((catalog) => quizMeta(catalog.questions.length));

export default function QuizScreen() {
  const vm = useViewModel(quizViewModel);
  const meta = useViewModel(metaViewModel);
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
  // Clavier : après une réponse, le focus passe au titre de la question suivante (sinon il
  // retombe sur <body> et il faudrait retraverser l'en-tête à chaque question).
  const titleRef = useRef<{ focus?: () => void } | null>(null);
  const firstQuestion = useRef(true);
  useEffect(() => {
    if (!vm.question) return;
    if (firstQuestion.current) {
      firstQuestion.current = false;
      return;
    }
    titleRef.current?.focus?.();
  }, [vm.question?.id]);

  // Groupe radio (web) : Espace choisit, les flèches déplacent le focus. Entrée est déjà un appui.
  const onRadioKey = (value: AnswerValue) => (event: unknown) => {
    if (Platform.OS !== 'web') return;
    const e = event as { key: string; currentTarget: HTMLElement; preventDefault: () => void };
    const radios = [
      ...(e.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll('[role="radio"]') ?? []),
    ] as HTMLElement[];
    const action = radioKeyAction(e.key, radios.indexOf(e.currentTarget), radios.length);
    if (!action) return;
    e.preventDefault();
    if (action.type === 'choose') choose(value);
    else radios[action.index]?.focus();
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
  return (
    <Page meta={meta} loading={!vm.ready} focus back={{ label: 'Quitter', href: '/' }}>
      {vm.question ? (
        <View style={{ gap: effects.spacing.md }}>
          {vm.resultsLostMessage && vm.answeredCount === 0 ? (
            <Card>
              <Text role="status">{vm.resultsLostMessage}</Text>
            </Card>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.smd }}>
            <Arc
              value={(vm.index + 1) / vm.total}
              size={96}
              strokeWidth={9}
              accessibilityLabel={`Question ${vm.index + 1} sur ${vm.total}`}
            >
              <Text style={{ ...fonts.displayBold, fontSize: 16, color: colors.tint }}>
                {vm.index + 1}/{vm.total}
              </Text>
            </Arc>
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="caption">{vm.themeTitle}</Text>
            </View>
          </View>

          <Enter
            key={vm.question.id}
            kind={direction.current}
            duration={duration.question}
            reducedFade
            style={{ gap: effects.spacing.md }}
          >
            <Text
              ref={titleRef as never}
              {...({ tabIndex: -1 } as object)}
              variant="title"
              style={{ fontSize: 25, lineHeight: 32, outlineStyle: 'none' as never }}
            >
              {vm.question.statement}
            </Text>

            <Accordion headingLevel={2} title="Besoin d'un coup de pouce ?">
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.question.help}</Text>
            </Accordion>

            <View style={{ gap: effects.spacing.sm }} accessibilityRole="radiogroup">
              {opinions.map((choice) => {
                const selected = selectedValue === choice.value;
                return (
                  <Pressable
                    key={String(choice.value)}
                    haptic
                    onPress={() => choose(choice.value)}
                    {...({ onKeyDown: onRadioKey(choice.value) } as object)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: effects.spacing.smd,
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
                {...({ onKeyDown: onRadioKey(null) } as object)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedValue === null }}
                aria-checked={selectedValue === null}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 56,
                  paddingHorizontal: effects.spacing.smd,
                  borderRadius: effects.borderRadius.small,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: selectedValue === null ? colors.tint : colors.surface.border.primary,
                  backgroundColor: selectedValue === null ? colors.tintSoft : 'transparent',
                }}
              >
                <Text
                  style={{ fontSize: 17, ...(selectedValue === null ? fonts.bold : fonts.regular) }}
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
                  backgroundColor: vm.important ? colors.tint : colors.surface.border.tertiary,
                  transitionProperty: 'backgroundColor',
                  transitionDuration: ms(duration.open),
                }}
              >
                <Animated.View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.background.primary,
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
