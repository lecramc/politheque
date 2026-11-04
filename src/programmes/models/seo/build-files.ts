// Point d'entrée du script post-export (scripts/postexport.mjs).
// N'importe que des données et des modules purs : jamais react-native ni expo-router.
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import { buildRobotsTxt } from '@/src/programmes/models/seo/robots';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';
import { buildSitemapXml } from '@/src/programmes/models/seo/sitemap';

/** Décision éditoriale D5 : les robots d'entraînement IA sont autorisés. */
export const ALLOW_AI_TRAINING = true;

export function buildSeoFiles() {
  const catalog = buildStaticCatalog();
  const urls = expandRoutes(catalog);
  return {
    sitemap: buildSitemapXml(urls),
    robots: buildRobotsTxt({ allowTraining: ALLOW_AI_TRAINING }),
    llms: buildLlmsTxt(catalog, urls),
    pages: urls.map((u) => ({
      path: u.path,
      indexable: u.indexable,
      // Pages de contenu (motifs dynamiques indexables) : au moins un <h2>.
      content: u.indexable && u.pattern.includes('['),
    })),
  };
}
