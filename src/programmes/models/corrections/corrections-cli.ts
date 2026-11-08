// Point d'entrée de scripts/corrections.mjs (hook commit-msg). Modules purs uniquement.
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';

export * from '@/src/programmes/models/corrections/correction-trailers';
export * from '@/src/programmes/models/corrections/corrections-retro';
export * from '@/src/programmes/models/corrections/corrections.model';
export * from '@/src/programmes/models/corrections/corrections.service';

/**
 * Pages indexables du registre des routes, d'après le catalogue du dossier de travail, plus
 * l'alias `/partis/[id]` (adresse toujours valide des anciennes entrées du journal).
 */
export const indexablePaths = (): string[] =>
  expandRoutes(buildStaticCatalog())
    .filter((u) => u.indexable || u.pattern === '/partis/[id]')
    .map((u) => u.path);
