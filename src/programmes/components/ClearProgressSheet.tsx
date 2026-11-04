import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Sheet } from '@/src/programmes/components/Sheet';
import { JOURNEY_COPY } from '@/src/programmes/models/journey.copy';

/** Confirmation avant d'effacer la progression locale (les réponses en mémoire restent). */
export function ClearProgressSheet({
  isOpen,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={JOURNEY_COPY.clearSheetTitle}>
      <Text style={{ color: colors.text.secondary }}>{JOURNEY_COPY.clearSheetText}</Text>
      <Button variant="danger" onPress={onConfirm} onGlass>
        {JOURNEY_COPY.clearConfirm}
      </Button>
      <Button variant="tertiary" onPress={onClose} onGlass>
        {JOURNEY_COPY.clearCancel}
      </Button>
    </Sheet>
  );
}
