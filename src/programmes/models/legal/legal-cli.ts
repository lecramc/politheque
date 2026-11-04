// Point d'entrée des scripts (affaires-echeances.mjs, postexport.mjs). Modules purs uniquement.
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { followUps } from '@/src/programmes/models/legal/legal-followup';

export {
  renderFollowUpBlock,
  replaceMarkedBlock,
} from '@/src/programmes/models/legal/legal-followup';

/** Échéances et entrées à revérifier des dossiers publiés. */
export const publishedFollowUps = (today: string) => followUps(buildStaticCatalog().legal, today);
