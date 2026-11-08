import React, { useState } from 'react';
import { Linking, Platform, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { canCopy, canPrint, copyText, printPage } from '@/src/core/web/browser-actions';
import { Card } from '@/src/programmes/components/Card';

export const PRIVACY_SENTENCE =
  "Rien n'est envoyé à Polithèque : le lien et l'e-mail sont créés sur votre appareil.";

/** « Garder mes résultats » : lien personnel, e-mail (mailto:), impression / PDF. */
export function KeepResults({ personalLink, mailto }: { personalLink: string; mailto: string }) {
  const { colors, effects, fonts } = useTheme();
  const hydrated = useHydrated();
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  const copy = async () => setCopied((await copyText(personalLink)) ? 'done' : 'failed');
  const copyLabel =
    copied === 'done' ? 'Lien copié' : copied === 'failed' ? 'Copie impossible' : 'Copier mon lien';

  return (
    <Card>
      <Text
        accessibilityRole="header"
        aria-level={2}
        style={{
          ...fonts.display,
          fontSize: effects.sizes.text.display,
          color: colors.text.strong,
        }}
      >
        Garder mes résultats
      </Text>
      <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
        Le lien personnel contient vos réponses : ne le partagez qu'avec qui vous voulez.
      </Text>
      <View style={{ gap: effects.spacing.xs }}>
        {hydrated && canCopy() ? (
          <Button variant="secondary" onPress={copy}>
            {copyLabel}
          </Button>
        ) : null}
        <MailtoButton href={mailto}>M'envoyer mon récapitulatif</MailtoButton>
        {hydrated && canPrint() ? (
          <Button variant="secondary" onPress={printPage}>
            Télécharger en PDF / imprimer
          </Button>
        ) : null}
      </View>
      <Text role="status" style={{ color: colors.text.secondary, fontSize: 14 }}>
        {PRIVACY_SENTENCE}
      </Text>
    </Card>
  );
}

/**
 * Lien `mailto:` sans destinataire, habillé comme un bouton secondaire. Un vrai lien (<a href>) sur
 * le web : la messagerie de l'utilisateur s'ouvre et c'est elle qui envoie. Sur natif, `Linking`.
 */
function MailtoButton({ href, children }: { href: string; children: string }) {
  const { colors, effects } = useTheme();
  return (
    <Text
      // @ts-expect-error `href` est géré par react-native-web (rendu en <a>) ; absent des types RN.
      href={href}
      role="link"
      onPress={Platform.OS === 'web' ? undefined : () => Linking.openURL(href)}
      style={{
        height: effects.sizes.button.large,
        lineHeight: effects.sizes.button.large,
        textAlign: 'center',
        borderRadius: effects.borderRadius.round,
        borderWidth: 0.5,
        borderColor: colors.surface.border.secondary,
        backgroundColor: colors.surface.secondary,
        color: colors.text.primary,
        fontSize: effects.sizes.text.body,
      }}
    >
      {children}
    </Text>
  );
}
