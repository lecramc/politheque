import { MIN_COMPARED } from '@/src/programmes/models/matching.service';
import { scoreMargin } from '@/src/programmes/models/results-ranking.service';
import { howToReadBullets } from '@/src/programmes/models/results.copy';

/**
 * Textes des feuilles « Comment lire cette page » : une seule source, utilisée par les écrans
 * (feuille) et par /methodologie (texte visible dans le HTML, ancres `#lire-…`).
 */

/** Explication longue de la légende, dans « Comment lire cette page » (une seule fois par page). */
export const STANCE_LEGEND_TEXT =
  'Rond plein : position nette. Contour : position nuancée. Rond en pointillés : pas de position claire dans les sources. Une seule couleur pour toutes les positions : le sens se lit dans le symbole et le libellé, jamais dans la couleur.';

export const positionsGuideParagraphs = (questionCount: number, partyCount: number) =>
  [
    `Ce que le parti défend sur les ${questionCount} affirmations du questionnaire, d'après ses programmes, ses votes et ses déclarations. Les thèmes sont toujours dans le même ordre, pour les ${partyCount} partis.`,
    STANCE_LEGEND_TEXT,
  ] as const;

export const COMPARE_GUIDE_TEXT =
  "Positions établies d'après les programmes, les votes et les déclarations des partis. Chaque position renvoie à ses sources. Les partis sont présentés dans l'ordre où vous les avez choisis, sans score ni classement.";

export const CLASSIFICATION_GUIDE_TEXT =
  "Les étiquettes viennent de la presse de référence, des politistes et du ministère de l'Intérieur ; chaque parti peut les contester. Le même traitement s'applique à tous.";

export const KEY_IDEAS_GUIDE_TEXT = 'Les mots entre guillemets sont ceux du parti.';

export const RESULTS_GUIDE_INTRO = 'Comment lire ces résultats :';

/** Ancres de /methodologie (une par feuille « Comment lire… »). */
export const GUIDE_ANCHORS = {
  positions: 'lire-fiche-parti',
  results: 'lire-resultats',
  compare: 'lire-comparaison',
  classification: 'lire-etiquettes',
  keyIdeas: 'lire-idees',
} as const;

export type ReadingGuideAnchor = (typeof GUIDE_ANCHORS)[keyof typeof GUIDE_ANCHORS];

export interface ReadingGuideSection {
  anchor: ReadingGuideAnchor;
  title: string;
  paragraphs: readonly string[];
  /** Puces (résultats), précédées du dernier paragraphe. */
  bullets?: readonly string[];
}

/** Sections publiées sur /methodologie, dans l'ordre de la page. */
export const readingGuideSections = (
  questionCount: number,
  partyCount: number
): ReadingGuideSection[] => [
  {
    anchor: GUIDE_ANCHORS.keyIdeas,
    title: 'Lire « Ce qu’il propose » : les 4 idées',
    paragraphs: [KEY_IDEAS_GUIDE_TEXT],
  },
  {
    anchor: GUIDE_ANCHORS.positions,
    title: 'Lire les positions d’un parti',
    paragraphs: positionsGuideParagraphs(questionCount, partyCount),
  },
  {
    anchor: GUIDE_ANCHORS.classification,
    title: 'Lire la classification d’un parti',
    paragraphs: [CLASSIFICATION_GUIDE_TEXT],
  },
  {
    anchor: GUIDE_ANCHORS.compare,
    title: 'Lire la comparaison de deux partis',
    paragraphs: [COMPARE_GUIDE_TEXT],
  },
  {
    anchor: GUIDE_ANCHORS.results,
    title: 'Lire les résultats du questionnaire',
    paragraphs: [RESULTS_GUIDE_INTRO],
    bullets: howToReadBullets(MIN_COMPARED, scoreMargin(questionCount, questionCount)),
  },
];
