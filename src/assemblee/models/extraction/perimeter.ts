import { normalizeTitle } from '@/src/assemblee/models/extraction/normalize';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';
import type { ScrutinCategory, ScrutinRule } from '@/src/assemblee/models/scrutin.model';

export type Classification =
  | { inclus: true; regles: [ScrutinRule]; categorie: ScrutinCategory }
  | { inclus: false; regles: []; categorie: null };

/**
 * Règle publique du périmètre : une liste fermée, évaluée par programme sur tous les scrutins
 * publics. Reprise telle quelle sur la page et dans la méthode (ne la modifier qu'avec les textes
 * de `locales/*\/assemblee.json`). Les amendements, les articles isolés, les motions de rejet
 * rejetées et les autres motions de procédure n'en font pas partie.
 */
export const PERIMETER_RULES: string[] = [
  "R1 : vote sur l'ensemble d'un projet ou d'une proposition de loi, ou sur une proposition de résolution, quelle que soit la formulation du titre",
  "R2 : vote sur l'article unique d'un tel texte (texte à un seul article)",
  'R3 : motion de censure (article 49, alinéas 2 et 3)',
  'R4 : vote de confiance sur une déclaration de politique générale (article 49, alinéa 1) ou vote sur une déclaration du Gouvernement (article 50-1)',
  "R5 : motion de rejet préalable adoptée (elle rejette l'ensemble du texte)",
  "R6 : vote sur une partie (première, deuxième ou troisième) d'un projet de loi de finances ou de financement de la sécurité sociale",
];

const BILL = '(?:projet|proposition) de loi\\b';
const RESOLUTION = 'proposition de résolution\\b';
const TEXT = `(?:${BILL}|${RESOLUTION})`;
const FINANCE_PART =
  '(?:première|deuxième|seconde|troisième) partie (?:du )?projet de loi de (?:finances|financement)\\b';

/** Têtes de titre reconnues (titre normalisé : minuscules, apostrophes droites). */
const PART_OF_FINANCE_BILL = new RegExp(`^(?:l'ensemble (?:de )+)?la ${FINANCE_PART}`);
const WHOLE_TEXT = new RegExp(
  `^(?:l'ensemble (?:(?:de )+la|du) |le (?=projet)|la (?=proposition))${TEXT}`
);
const SINGLE_ARTICLE = new RegExp(`^l'article unique (?:de la|du) ${TEXT}`);
const GOVERNMENT_DECLARATION = /^la déclaration (?:de politique générale )?du gouvernement\b/;
const CONFIDENCE = /article 49, alinéa (?:premier|1(?:er)?)\b/;
const ARTICLE_50_1 = /article 50-1\b/;
const PRELIMINARY_REJECTION = /^(?:sur )?la motion de rejet p\S*alable\b/;

const classified = (rule: ScrutinRule, categorie: ScrutinCategory): Classification => ({
  inclus: true,
  regles: [rule],
  categorie,
});

const EXCLUDED: Classification = { inclus: false, regles: [], categorie: null };

/**
 * Classe un scrutin sur sa nature : le type de vote pour les motions de censure (champ
 * structuré), la tête du titre normalisé pour le reste (l'open data ne porte la nature du vote
 * que dans le titre). Jamais de cas par cas.
 */
export const classifyScrutin = (raw: RawScrutin): Classification => {
  if (raw.typeVote.codeTypeVote === 'MOC') return classified('R3', 'censure');
  const title = normalizeTitle(raw.titre);
  if (PART_OF_FINANCE_BILL.test(title)) return classified('R6', 'partie-budget');
  const wholeText = WHOLE_TEXT.exec(title);
  if (wholeText)
    return classified('R1', wholeText[0].includes('résolution') ? 'resolution' : 'texte');
  if (SINGLE_ARTICLE.test(title)) return classified('R2', 'article-unique');
  if (GOVERNMENT_DECLARATION.test(title)) {
    if (CONFIDENCE.test(title)) return classified('R4', 'confiance');
    if (ARTICLE_50_1.test(title)) return classified('R4', 'declaration');
    return EXCLUDED;
  }
  if (PRELIMINARY_REJECTION.test(title) && raw.sort.code === 'adopté') {
    return classified('R5', 'rejet-prealable');
  }
  return EXCLUDED;
};

/**
 * Scrutin qui devrait être classé et ne l'est pas : un scrutin solennel ou une motion que
 * aucune règle ne reconnaît, ou un titre qui commence comme un vote sur l'ensemble d'un texte
 * sans figurer dans la liste fermée. À corriger dans la liste, jamais à ignorer.
 */
export const isUnclassifiedSolemn = (raw: RawScrutin): boolean => {
  if (classifyScrutin(raw).inclus) return false;
  const solemn = ['SPS', 'MOC'].includes(raw.typeVote.codeTypeVote);
  return solemn || normalizeTitle(raw.titre).startsWith("l'ensemble");
};
