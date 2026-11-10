import { normalizeTitle } from '@/src/assemblee/models/extraction/normalize';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';
import type { ScrutinCategory, ScrutinRule } from '@/src/assemblee/models/scrutin.model';

export type Classification = {
  inclus: boolean;
  regles: ScrutinRule[];
  categorie: ScrutinCategory;
};

/** Description publique des règles (manifeste et page de méthode). */
export const PERIMETER_RULES: string[] = [
  "R1 : le titre commence par « l'ensemble » (vote sur l'ensemble d'un texte)",
  'R2 : scrutin public solennel (code SPS)',
  'R3 : motion de censure (code MOC)',
  "R4 : le scrutin porte sur l'article unique d'un projet ou d'une proposition de loi (organique comprise)",
];

const SINGLE_ARTICLE_OF_A_BILL = [
  "l'article unique du projet de loi",
  "l'article unique de la proposition de loi",
];

const matchedRules = (raw: RawScrutin, title: string): ScrutinRule[] => {
  const rules: ScrutinRule[] = [];
  if (title.startsWith("l'ensemble")) rules.push('R1');
  if (raw.typeVote.codeTypeVote === 'SPS') rules.push('R2');
  if (raw.typeVote.codeTypeVote === 'MOC') rules.push('R3');
  if (SINGLE_ARTICLE_OF_A_BILL.some((prefix) => title.startsWith(prefix))) rules.push('R4');
  return rules;
};

/** Catégorie calculée sur le titre, jamais saisie à la main ; tout titre non reconnu → « autre ». */
const categoryOf = (title: string, rules: ScrutinRule[]): ScrutinCategory => {
  if (rules.includes('R3')) return 'censure';
  if (title.startsWith('la déclaration')) return 'declaration';
  if (title.startsWith('la première partie du projet de loi de finances')) {
    return 'premiere-partie-budget';
  }
  if (/\bproposition de résolution\b/.test(title)) return 'resolution';
  if (rules.includes('R4') && !rules.includes('R1')) return 'article-unique';
  if (rules.includes('R1') || /\b(projet|proposition) de loi\b/.test(title)) return 'texte';
  return 'autre';
};

export const classifyScrutin = (raw: RawScrutin): Classification => {
  const title = normalizeTitle(raw.titre);
  const regles = matchedRules(raw, title);
  return { inclus: regles.length > 0, regles, categorie: categoryOf(title, regles) };
};
