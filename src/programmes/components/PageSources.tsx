import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Accordion } from '@/src/programmes/components/Accordion';
import { SourceList } from '@/src/programmes/components/SourceChip';
import { groupPageSources } from '@/src/programmes/models/page-sources.service';
import type { Source } from '@/src/programmes/models/programme.model';

/** Bloc « Sources de cette page » : toutes les sources citées sur la page, au même endroit. */
export function PageSources({ sources }: { sources: Source[] }) {
  const { colors } = useTheme();
  const groups = groupPageSources(sources);
  const count = groups.reduce((n, g) => n + g.sources.length, 0);
  if (count === 0) return null;
  return (
    <Accordion
      headingLevel={2}
      title={`Sources de cette page (${count})`}
      subtitle="D'où viennent les informations ci-dessus"
    >
      {groups.map((group) => (
        <View key={group.kind} style={{ gap: 4 }}>
          <Text variant="caption">
            {group.label} ({group.sources.length})
          </Text>
          <SourceList sources={group.sources} />
        </View>
      ))}
      <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
        Chaque information porte aussi sa propre pastille de sources, à l'endroit où elle apparaît.
      </Text>
    </Accordion>
  );
}
