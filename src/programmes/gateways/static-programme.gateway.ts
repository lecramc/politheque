import { LEGAL_DOSSIERS } from '@/src/programmes/data/affaires';
import corrections from '@/src/programmes/data/corrections.json';
import { ELECTIONS } from '@/src/programmes/data/elections';
import guide from '@/src/programmes/data/guide.json';
import { PARTIES } from '@/src/programmes/data/parties';
import { AXES, QUESTIONS } from '@/src/programmes/data/questions';
import themes from '@/src/programmes/data/themes.json';
import type { ProgrammeGateway } from '@/src/programmes/gateways/programme.gateway';
import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import type { Catalog, GuideSection, Theme } from '@/src/programmes/models/programme.model';

/** Données embarquées dans le bundle : le site est statique, rien ne part vers un serveur. */
export const buildStaticCatalog = (): Catalog => ({
  // Ordre alphabétique partout par défaut : aucune hiérarchie implicite entre les partis.
  parties: [...PARTIES].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  elections: ELECTIONS,
  themes: themes as Theme[],
  questions: QUESTIONS,
  axes: AXES,
  guide: guide as GuideSection[],
  corrections: corrections as CorrectionEntry[],
  legal: LEGAL_DOSSIERS,
});

export class StaticProgrammeGateway implements ProgrammeGateway {
  async loadCatalog(): Promise<Catalog> {
    return buildStaticCatalog();
  }
}
