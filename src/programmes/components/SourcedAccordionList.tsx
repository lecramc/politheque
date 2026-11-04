import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Accordion } from '@/src/programmes/components/Accordion';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { TitledSourcedText } from '@/src/programmes/models/programme.model';
import { bodyText } from '@/src/programmes/models/sourced-item.service';

/** Liste de lignes repliables : titre court rédigé, texte intégral sourcé à l'ouverture. */
export function SourcedAccordionList({ items }: { items: TitledSourcedText[] }) {
  const { effects } = useTheme();
  return (
    <>
      {items.map((item) => (
        <Accordion key={item.title} title={item.title}>
          <Text style={{ fontSize: effects.sizes.text.body, lineHeight: 25 }}>
            {bodyText(item)}
          </Text>
          <SourceChip sources={item.sources} subject={item.title} />
        </Accordion>
      ))}
    </>
  );
}
