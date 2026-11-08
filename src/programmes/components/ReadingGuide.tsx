import React, { ReactNode, useState } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/src/programmes/components/Sheet';

/**
 * Un seul rappel de méthode par page : le lien « Comment lire cette page » ouvre une feuille.
 * Les mentions toujours visibles (consigne de vote, présomption d'innocence, dates) restent hors de la feuille.
 */
export function ReadingGuide({
  label = 'Comment lire cette page',
  title = label,
  children,
}: {
  label?: string;
  title?: string;
  children: ReactNode;
}) {
  const { colors, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityHint="Ouvre une explication"
        style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
      >
        <Text
          style={{
            ...fonts.regular,
            fontSize: 15,
            color: colors.tint,
            textDecorationLine: 'underline',
          }}
        >
          {label}
        </Text>
      </Pressable>
      <Sheet isOpen={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Sheet>
    </>
  );
}
