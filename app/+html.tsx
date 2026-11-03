import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Document HTML racine de l'export web statique (langue, titre, description).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Travée — la politique française, expliquée simplement</title>
        <meta
          name="description"
          content="Institutions, partis, élections et grands débats : comprendre la politique française et la présidentielle 2027, avec la source de chaque information."
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
