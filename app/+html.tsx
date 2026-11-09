import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Asset } from 'expo-asset';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { theme } from '@/components/ThemeContext';
import { themeVarsCss } from '@/components/webTheme';
import { APP_NAME, SITE_LOCALE } from '@/src/core/config/app';
import { colorSchemeCss, layoutCss } from '@/src/core/web/layout-css';
import { printCss } from '@/src/core/web/print-css';

// Polices du site (mêmes noms de famille que `theme.fonts`). Sur le web elles sont déclarées ici,
// en `@font-face` statiques avec `font-display: swap` (texte visible tout de suite, police système
// en attendant) ; `app/_layout.tsx` ne les charge plus via `useFonts` sur le web. Seules les deux
// polices du texte courant et des titres sont préchargées : les autres variantes se chargent à la demande.
const FONT_FILES = [
  {
    family: 'AtkinsonHyperlegible_400Regular',
    module: AtkinsonHyperlegible_400Regular,
    preload: true,
  },
  {
    family: 'AtkinsonHyperlegible_400Regular_Italic',
    module: AtkinsonHyperlegible_400Regular_Italic,
  },
  { family: 'AtkinsonHyperlegible_700Bold', module: AtkinsonHyperlegible_700Bold },
  { family: 'Fraunces_600SemiBold', module: Fraunces_600SemiBold, preload: true },
  { family: 'Fraunces_700Bold', module: Fraunces_700Bold },
].map((font) => ({ ...font, uri: Asset.fromModule(font.module).uri }));

const fontFaceCss = FONT_FILES.map(
  (font) =>
    `@font-face{font-family:"${font.family}";src:url("${font.uri}") format("truetype");font-style:normal;font-display:swap}`
).join('\n');

// Document HTML racine de l'export web statique : uniquement les invariants du site.
// Tout ce qui dépend de la page (title, description, canonical, Open Graph, JSON-LD)
// vient de SeoHead : rien ne doit être émis aux deux endroits (pas de déduplication ici).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#FBF8F3" media="(prefers-color-scheme: light)" />
        <meta
          name="theme-color"
          content={theme.dark.background.secondary}
          media="(prefers-color-scheme: dark)"
        />
        <meta name="color-scheme" content="light dark" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:locale" content={SITE_LOCALE} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/logo-512.png" />
        {FONT_FILES.filter((font) => font.preload).map((font) => (
          <link
            key={font.family}
            rel="preload"
            href={font.uri}
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
        ))}
        <style id="travee-fonts" dangerouslySetInnerHTML={{ __html: fontFaceCss }} />
        <ScrollViewStyleReset />
        {/* Mise en page desktop : media queries sur data-tv, identique au premier rendu client. */}
        <style id="travee-layout" dangerouslySetInnerHTML={{ __html: layoutCss }} />
        {/* Impression (« Télécharger en PDF / imprimer ») : voir src/core/web/print-css.ts. */}
        <style
          id="travee-scheme"
          dangerouslySetInnerHTML={{ __html: colorSchemeCss(theme.dark.background.secondary) }}
        />
        {/* Couleurs du thème en variables CSS : voir components/webTheme.ts. */}
        <style id="travee-theme" dangerouslySetInnerHTML={{ __html: themeVarsCss }} />
        <style id="travee-print" dangerouslySetInnerHTML={{ __html: printCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
