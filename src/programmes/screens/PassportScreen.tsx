import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Card } from '@/src/programmes/components/Card';
import { ClearProgressSheet } from '@/src/programmes/components/ClearProgressSheet';
import { Page } from '@/src/programmes/components/Page';
import { PassportCover } from '@/src/programmes/components/PassportCover';
import { PrivacyNote } from '@/src/programmes/components/PrivacyNote';
import { StampGrid } from '@/src/programmes/components/StampGrid';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';
import { passportViewModel } from '@/src/programmes/view-models/passport.view-model';

/**
 * Passeport du citoyen : tampons d'étape, détail par partis et débats.
 * Aucun partage, aucun résultat du questionnaire, aucune date de lecture.
 * Non indexé : la page statique est vide de progression.
 */
export default function PassportScreen() {
  const vm = useViewModel(passportViewModel());
  const { colors, effects, fonts } = useTheme();
  const [clearOpen, setClearOpen] = useState(false);

  return (
    <Page
      title={JOURNEY_COPY.passportHeading}
      loading={vm.status !== 'loaded'}
      back={{ label: JOURNEY_COPY.back, href: '/comprendre' }}
    >
      <PassportCover
        heading={vm.heading}
        subtitle={vm.subtitle}
        stamps={vm.stamps}
        celebrate={vm.celebrations}
        onCelebrated={vm.celebrationsShown}
      />
      <View
        style={{
          padding: effects.spacing.md,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.tintSoft,
        }}
      >
        <Text>{vm.quizNote}</Text>
      </View>
      <StampGrid title="Les partis" countLabel={vm.parties.countLabel} items={vm.parties.items} />
      <StampGrid
        title="Les grands débats"
        countLabel={vm.debates.countLabel}
        items={vm.debates.items}
      />
      <Card>
        <Text style={{ ...fonts.display, fontSize: 20 }}>{vm.whatNow.title}</Text>
        <Text style={{ color: colors.text.secondary }}>{vm.whatNow.text}</Text>
        <Link href={vm.whatNow.href as never} asChild>
          <Pressable
            accessibilityRole="link"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              borderRadius: effects.borderRadius.small,
              backgroundColor: colors.tintSoft,
            }}
          >
            <Text style={{ ...fonts.bold, color: colors.tint }}>{vm.whatNow.label}</Text>
          </Pressable>
        </Link>
      </Card>
      <PrivacyNote onClear={() => setClearOpen(true)} />
      <ClearProgressSheet
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          vm.clearProgress();
          setClearOpen(false);
        }}
      />
    </Page>
  );
}
