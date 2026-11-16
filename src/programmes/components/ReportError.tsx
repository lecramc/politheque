import React from 'react';
import { Linking, Platform, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { tv } from '@/src/core/web/tv';
import { REPORT_COPY } from '@/src/programmes/models/report-error.copy';
import type { ReportLinks } from '@/src/programmes/models/report-error.service';

/** Bloc discret « Signaler une erreur », en bas des pages de contenu. */
export function ReportError({ links }: { links: ReportLinks }) {
  const { colors, effects } = useTheme();
  return (
    <View {...tv('no-print')} style={{ gap: effects.spacing.xs, paddingTop: effects.spacing.lg }}>
      <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 21 }}>
        {REPORT_COPY.sentence} <TextLink href="/corrections">{REPORT_COPY.journalLabel}</TextLink>.
      </Text>
      <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
        {links.mailto ? (
          <>
            <ExternalLink href={links.mailto}>{REPORT_COPY.emailLabel}</ExternalLink> ·{' '}
          </>
        ) : null}
        <ExternalLink href={links.github} newTab>
          {REPORT_COPY.githubLabel}
        </ExternalLink>
      </Text>
    </View>
  );
}

/**
 * Lien sortant (mailto:, GitHub) : un vrai <a href> sur le web, car le `Link` du routeur réécrit
 * les adresses et perdrait le préremplissage (`?title=…&body=…`). Même style que `TextLink`.
 */
function ExternalLink({
  href,
  newTab = false,
  children,
}: {
  href: string;
  newTab?: boolean;
  children: string;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Text
      {...tv('text-link')}
      role="link"
      {...(Platform.OS === 'web'
        ? {
            href,
            ...(newTab ? { hrefAttrs: { target: '_blank', rel: 'noopener' } } : {}),
          }
        : { onPress: () => Linking.openURL(href) })}
      style={{ ...fonts.regular, color: colors.tint, textDecorationLine: 'underline' }}
    >
      {children}
    </Text>
  );
}
