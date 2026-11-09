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
// Fichiers WOFF2 (`public/assets/fonts/`, cache immuable d'un an) convertis sans sous-ensemble depuis
// les TTF de `@expo-google-fonts` : le suffixe est l'empreinte du fichier, à changer s'il est régénéré.
// Procédure : `public/assets/fonts/README.md`.
const FONT_FILES = [
  {
    family: 'AtkinsonHyperlegible_400Regular',
    file: 'AtkinsonHyperlegible_400Regular.8e0c323aed.woff2',
    preload: true,
  },
  {
    family: 'AtkinsonHyperlegible_400Regular_Italic',
    file: 'AtkinsonHyperlegible_400Regular_Italic.7306c563cc.woff2',
  },
  { family: 'AtkinsonHyperlegible_700Bold', file: 'AtkinsonHyperlegible_700Bold.10cd24314b.woff2' },
  { family: 'Fraunces_600SemiBold', file: 'Fraunces_600SemiBold.c882f3e141.woff2', preload: true },
  { family: 'Fraunces_700Bold', file: 'Fraunces_700Bold.77ea9b849f.woff2' },
].map((font) => ({ ...font, uri: `/assets/fonts/${font.file}` }));

const fontFaceCss = FONT_FILES.map(
  (font) =>
    `@font-face{font-family:"${font.family}";src:url("${font.uri}") format("woff2");font-style:normal;font-display:swap}`
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
        {/* Vérification de la propriété Search Console https://politheque.revaamp.com/ : ne pas retirer. */}
        <meta
          name="google-site-verification"
          content="C5MAACishvsX3if_MYlszbfkc1qucwkB863xlbhsur0"
        />
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
            type="font/woff2"
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
