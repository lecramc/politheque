import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { APP_NAME, SITE_LOCALE } from '@/src/core/config/app';
import { layoutCss } from '@/src/core/web/layout-css';

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
        <meta name="theme-color" content="#FBF8F3" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:locale" content={SITE_LOCALE} />
        <meta name="twitter:card" content="summary_large_image" />
        <ScrollViewStyleReset />
        {/* Mise en page desktop : media queries sur data-tv, identique au premier rendu client. */}
        <style id="travee-layout" dangerouslySetInnerHTML={{ __html: layoutCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
