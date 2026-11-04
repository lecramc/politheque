import React, { ReactNode } from 'react';

import { Text } from '@/components/Themed';

/** Titre de section de la fiche : sobre (pas de surtitre en majuscules), vrai titre de niveau 2. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
      {children}
    </Text>
  );
}
