import React, { ReactNode, useState } from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Sheet } from '@/src/programmes/components/Sheet';

/**
 * Un seul rappel de méthode par page : le lien « Comment lire cette page » ouvre une feuille.
 * Les mentions toujours visibles (consigne de vote, présomption d'innocence, dates) restent hors de la feuille.
 */
export function ReadingGuide({
  label = 'Comment lire cette page',
  title = label,
  anchor,
  children,
}: {
  label?: string;
  title?: string;
  /** Ancre de /methodologie où le même texte est publié (visible dans le HTML). */
  anchor: string;
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
        <TextLink href={`/methodologie#${anchor}`} standalone>
          Voir ce texte dans la méthodologie
        </TextLink>
      </Sheet>
    </>
  );
}
