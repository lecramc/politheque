import Head from 'expo-router/head';
import React from 'react';
import { Platform } from 'react-native';

import { SITE_URL } from '@/src/core/config/app';
import { serializeJsonLd } from '@/src/programmes/models/seo/json-ld';
import { OG_IMAGE_ALT, type PageMeta } from '@/src/programmes/models/seo/page-meta';
import { absoluteUrl } from '@/src/programmes/models/seo/site-routes';

/**
 * Balises de tête d'une page : title, description, canonical, robots, Open Graph, JSON-LD.
 * Web uniquement : le Head natif a des effets de bord inutiles (handoff iOS).
 */
export function SeoHead({ meta }: { meta: PageMeta }) {
  if (Platform.OS !== 'web') return null;
  const url = absoluteUrl(meta.path);
  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={meta.robots} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={meta.ogType} />
      <meta property="og:image" content={`${SITE_URL}/og.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {meta.jsonLd ? (
        <script type="application/ld+json">{serializeJsonLd(meta.jsonLd)}</script>
      ) : null}
    </Head>
  );
}
