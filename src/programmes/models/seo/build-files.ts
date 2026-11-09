// Point d'entrée du script post-export (scripts/postexport.mjs).
// N'importe que des données et des modules purs : jamais react-native ni expo-router.
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { foldedSnippets } from '@/src/programmes/models/seo/folded-content';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import { buildLlmsFullTxt } from '@/src/programmes/models/seo/llms-full';
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
    llmsFull: buildLlmsFullTxt(catalog),
    pages: urls.map((u) => ({
      path: u.path,
      indexable: u.indexable,
      canonicalPath: u.canonicalPath,
      mustContain: foldedSnippets(catalog, u.path),
      // Pages de contenu (motifs dynamiques indexables, lexique, FAQ, comment voter) : au moins un <h2>.
      content:
        u.indexable &&
        (u.pattern.includes('[') ||
          [
            CONTENUS_2027_PATHS.lexicon,
            CONTENUS_2027_PATHS.faq,
            CONTENUS_2027_PATHS.voter,
          ].includes(u.path as never)),
    })),
  };
}
