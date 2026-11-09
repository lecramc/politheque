import { LEGAL_DOSSIERS } from '@/src/programmes/data/affaires';
import corrections from '@/src/programmes/data/corrections.json';
import { ELECTIONS } from '@/src/programmes/data/elections';
import candidates from '@/src/programmes/data/elections/candidats-2027.json';
import faq from '@/src/programmes/data/faq-presidentielle-2027.json';
import guide from '@/src/programmes/data/guide.json';
import lexicon from '@/src/programmes/data/lexique.json';
import { PARTIES } from '@/src/programmes/data/parties';
import { AXES, QUESTIONS } from '@/src/programmes/data/questions';
import themes from '@/src/programmes/data/themes.json';
import voter from '@/src/programmes/data/voter-2027.json';
import type { ProgrammeGateway } from '@/src/programmes/gateways/programme.gateway';
import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import type {
  Catalog,
  ElectionCandidates,
  FaqEntry,
  GuideSection,
  LexiconEntry,
  Theme,
  VoterGuide,
} from '@/src/programmes/models/programme.model';

/** Données embarquées dans le bundle : le site est statique, rien ne part vers un serveur. */
export const buildStaticCatalog = (): Catalog => ({
  // Ordre alphabétique partout par défaut : aucune hiérarchie implicite entre les partis.
  parties: [...PARTIES].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  elections: ELECTIONS,
  themes: themes as Theme[],
  questions: QUESTIONS,
  axes: AXES,
  guide: guide as GuideSection[],
  lexicon: lexicon as LexiconEntry[],
  faq: faq as FaqEntry[],
  voter: voter as VoterGuide,
  candidates: candidates as ElectionCandidates,
  corrections: corrections as CorrectionEntry[],
  legal: LEGAL_DOSSIERS,
});

export class StaticProgrammeGateway implements ProgrammeGateway {
  async loadCatalog(): Promise<Catalog> {
    return buildStaticCatalog();
  }
}
