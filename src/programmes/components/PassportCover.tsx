import { Link } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Card } from '@/src/programmes/components/Card';
import { LogoMark } from '@/src/programmes/components/Logo';
import { Stamp } from '@/src/programmes/components/Stamp';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';
import type { JourneyStepId } from '@/src/programmes/models/journey.model';

/** Couverture du passeport : logo, titre et grille 3 × 2 des tampons d'étape. */
export function PassportCover({
  heading,
  stamps,
  subtitle,
  celebrate = [],
  onCelebrated,
}: {
  heading: string;
  /** null avant le chargement : même hauteur, sans texte. */
  subtitle: string | null;
  stamps: {
    stepId: JourneyStepId;
    title: string;
    icon: string;
    state: 'stamped' | 'empty';
    href: string;
  }[];
  /** Tampons gagnés pendant la session : ils se posent ici si cet écran est vu en premier. */
  celebrate?: JourneyStepId[];
  onCelebrated?: (ids: JourneyStepId[]) => void;
}) {
  const { colors, effects, fonts } = useTheme();
  const { reduce } = useMotion();
  useEffect(() => {
    if (celebrate.length === 0 || !onCelebrated) return;
    const timer = setTimeout(
      () => onCelebrated(celebrate),
      reduce ? duration.stampFade : duration.stamp
    );
    return () => clearTimeout(timer);
  }, [celebrate, onCelebrated, reduce]);
  return (
    <Card style={{ alignItems: 'center', gap: effects.spacing.md, padding: effects.spacing.lg }}>
      <LogoMark width={72} />
      <Text variant="caption">{JOURNEY_COPY.passportKicker}</Text>
      <Text variant="title" style={{ textAlign: 'center', fontSize: 30, lineHeight: 36 }}>
        {heading}
      </Text>
      <Text style={{ color: colors.text.secondary, opacity: subtitle ? 1 : 0 }}>
        {subtitle ?? ' '}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: effects.spacing.md }}>
        {stamps.map((stamp) => (
          <View key={stamp.stepId} style={{ width: '33.33%', alignItems: 'center' }}>
            <Link href={stamp.href as never} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${stamp.title}, ${stamp.state === 'stamped' ? 'tampon obtenu' : 'tampon à obtenir'}`}
                style={{ alignItems: 'center', gap: 6, padding: 4 }}
              >
                <Stamp
                  state={stamp.state}
                  size="cover"
                  icon={stamp.icon}
                  animateIn={celebrate.includes(stamp.stepId)}
                />
                <Text style={{ ...fonts.bold, fontSize: 14, textAlign: 'center' }}>
                  {stamp.title}
                </Text>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </Card>
  );
}
