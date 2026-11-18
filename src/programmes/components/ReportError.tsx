import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { tv } from '@/src/core/web/tv';
import { ExternalLink } from '@/src/programmes/components/ExternalLink';
import { REPORT_COPY } from '@/src/programmes/models/report-error.copy';
import type { ReportLinks } from '@/src/programmes/models/report-error.service';

/** Bloc discret « Signaler une erreur », en bas des pages de contenu. */
export function ReportError({
  links,
  column,
}: {
  links: ReportLinks;
  /** Colonne de contenu à suivre sur ordinateur (centrée, 768 px) ; sans valeur : bord du conteneur. */
  column?: 'solo' | 'list-col';
}) {
  const { colors, effects } = useTheme();
  return (
    <View
      {...tv('no-print', ...(column ? [column] : []))}
      style={{ gap: effects.spacing.xs, paddingTop: effects.spacing.lg }}
    >
      <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 21 }}>
        {REPORT_COPY.sentence} <TextLink href="/corrections">{REPORT_COPY.journalLabel}</TextLink>.
      </Text>
      <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 21 }}>
        {links.mailto ? (
          <>
            <ExternalLink href={links.mailto} size={14}>
              {REPORT_COPY.emailLabel}
            </ExternalLink>{' '}
            ·{' '}
          </>
        ) : null}
        <ExternalLink href={links.github} newTab size={14}>
          {REPORT_COPY.githubLabel}
        </ExternalLink>
      </Text>
    </View>
  );
}
