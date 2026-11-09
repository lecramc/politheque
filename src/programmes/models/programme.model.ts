import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';

// Modèle de données du comparateur de programmes.
// Règle éditoriale : aucune affirmation sans source vérifiable et datée.

export type ThemeId =
  | 'economie'
  | 'travail'
  | 'immigration'
  | 'securite'
  | 'ecologie'
  | 'sante'
  | 'education'
  | 'europe'
  | 'institutions';

export type AxisId = 'economique' | 'societal' | 'europe';

/** Nature de la source : un programme officiel pèse plus qu'une déclaration. */
export type SourceKind =
  | 'programme' // document programmatique officiel du parti / candidat
  | 'declaration' // interview, discours, tribune du candidat ou d'un porte-parole
  | 'vote' // vote des députés du groupe à l'Assemblée (scrutin public)
  | 'proposition-de-loi' // texte déposé par le groupe
  | 'presse' // article de presse rapportant la position (à défaut de source primaire)
  | 'statistique' // données publiques (INSEE, Cour des comptes, etc.)
  | 'justice'; // décision de justice, communiqué du parquet (Légifrance, Cour de cassation…)

export const SOURCE_KINDS: readonly SourceKind[] = [
  'programme',
  'declaration',
  'vote',
  'proposition-de-loi',
  'presse',
  'statistique',
  'justice',
];

export interface Source {
  title: string;
  url: string;
  /** ISO 8601 (AAAA-MM-JJ ou AAAA-MM). */
  date: string;
  kind: SourceKind;
}

export interface Measure {
  text: string;
  sources: Source[];
}

export interface PartyThemeProgramme {
  /** 2-3 phrases neutres, sans adjectif évaluatif. */
  summary: string;
  measures: Measure[];
}

/** -2 : fortement contre … +2 : fortement pour. null : position inconnue ou non tranchée. */
export type Stance = -2 | -1 | 0 | 1 | 2;

export interface PartyStance {
  stance: Stance | null;
  /** Une phrase factuelle qui justifie la position. */
  justification: string;
  sources: Source[];
}

/** Texte sourcé ; l'histoire et les idéaux exigent au moins 2 sources indépendantes. */
export interface SourcedText {
  text: string;
  sources: Source[];
}

/** Élément d'une liste repliable : titre court rédigé (≤ 60 caractères, sans affirmation), texte intégral sourcé. */
export interface TitledSourcedText extends SourcedText {
  title: string;
}

export interface HistoryEvent {
  /** ISO 8601 (AAAA, AAAA-MM ou AAAA-MM-JJ). */
  date: string;
  event: string;
  sources: Source[];
}

/** Fondateur ou figure marquante : qui, quel rôle, d'où il venait politiquement. */
export interface PartyFigure {
  name: string;
  /** Ex. « Fondateur et premier président (1972-2011) ». */
  role: string;
  /** Parcours et bord politique d'origine, factuel. */
  background: string;
  sources: Source[];
}

export interface PartyHistory {
  /** Ex. « 2016 (fondé sous le nom En marche) ». */
  founded: string;
  /** Origines et filiation, 3-4 phrases neutres. */
  origins: SourcedText;
  /** Valeurs et références revendiquées par le parti lui-même, puis telles que décrites par des chercheurs. */
  ideals: TitledSourcedText[];
  timeline: HistoryEvent[];
  /** Pourquoi le parti a été créé : contexte et objectifs déclarés. */
  whyCreated?: SourcedText;
  /** Fondateurs et figures marquantes. */
  figures?: PartyFigure[];
  /** Courants de pensée, références intellectuelles et doctrinales. */
  thought?: TitledSourcedText[];
}

/** Candidature d'un parti à une élection donnée, avec le programme présenté pour ce scrutin. */
export type CandidacyStatus = 'declare' | 'investi' | 'designe' | 'annonce' | 'pressenti';

/** État du programme présidentiel : liste fermée, affichée en une ligne sous « Ce qu'il propose ». */
export type ProgrammeState = 'publie' | 'partiel' | 'non-publie';

/** `thème.index` : désigne `candidacies[élection].themes[thème].measures[index]`. */
export type MeasureRef = `${ThemeId}.${number}`;

/**
 * Idée clé d'un parti (choix éditorial encadré, charte règle 11). Pas de champ `sources` : elles
 * sont dérivées des mesures référencées et des positions des questions liées (jamais de source nouvelle).
 */
export interface KeyIdea {
  /** Unique dans la fiche. */
  id: string;
  /** 60 caractères au plus, verbe à l'infinitif, termes connotés du parti entre guillemets. */
  title: string;
  /** Une phrase de 200 caractères au plus : ce qui change concrètement. */
  text: string;
  /** Au moins une ; la première donne le thème de l'idée. */
  measureRefs: MeasureRef[];
  /** Ids de questions pour lesquelles le parti a une position (0 à 2). */
  relatedQuestionIds: string[];
}

export type LeaderRole = 'présidé par' | 'dirigé par' | 'coordonné par';

export interface Candidacy {
  /** « Marine Le Pen » seul, pour les listes. */
  candidateName: string;
  status: CandidacyStatus;
  /** Libellé court et uniforme (« Candidat déclaré »). */
  statusLabel: string;
  /** Détail daté et sourcé du statut (dates, désignation, procédures) : affiché en feuille. */
  candidate: string;
  /** Date (ISO, AAAA-MM-JJ ou AAAA-MM) de l'annonce, de l'investiture ou de la désignation qui fonde le statut. */
  candidateDate?: string;
  /** Une phrase factuelle sur le statut (qui, quoi, quand, comment), même gabarit que `candidats-2027.json`. */
  candidateSummary?: string;
  /** Au moins deux sources indépendantes du statut de candidature. */
  candidateSources?: Source[];
  programmeStatus: string;
  /** Liste fermée ; `programmeStatus` reste le détail. */
  programmeState: ProgrammeState;
  /** 30 caractères au plus, pour « partiel » (ex. « 96 mesures »). */
  programmeStateDetail?: string;
  themes: Record<ThemeId, PartyThemeProgramme>;
}

/** Fiche permanente d'un parti : identité, histoire, positions. Indépendante d'un scrutin. */
export interface Party {
  id: string;
  name: string;
  shortName: string;
  /** Couleur d'identification (pastille), pas de connotation. */
  color: string;
  /** Famille politique telle que décrite par la science politique / presse de référence. */
  family: string;
  description: string;
  /** Année de fondation ; `history.founded` reste le détail. */
  foundedYear: number;
  leader: { name: string; role: LeaderRole };
  /** Exactement 4 idées, triées dans l'ordre des thèmes du site (même règle pour tous les partis). */
  keyIdeas: KeyIdea[];
  /** Date à laquelle les données de ce parti ont été vérifiées pour la dernière fois. */
  lastVerified: string;
  /** Absent tant que la passe « histoire et recoupement » n'a pas été faite. */
  history?: PartyHistory;
  /** Ce que le parti défend, prouvé par programme, votes et déclarations. */
  stances: Record<string, PartyStance>;
  /** Clé : id de l'élection (ex. « presidentielle-2027 »). */
  candidacies: Record<string, Candidacy>;
}

export type ElectionType =
  | 'presidentielle'
  | 'legislatives'
  | 'europeennes'
  | 'municipales'
  | 'senatoriales'
  | 'regionales'
  | 'departementales';

export interface DatedStep {
  label: string;
  /** ISO 8601. */
  date: string;
  sources: Source[];
}

export interface Election {
  id: string;
  type: ElectionType;
  title: string;
  status: 'a-venir' | 'en-cours' | 'passee';
  /** Mise en avant sur l'accueil (actualité). */
  featured: boolean;
  summary: string;
  summarySources: Source[];
  rounds: DatedStep[];
  keyDates: DatedStep[];
  /** Sections du guide « Comprendre » utiles pour ce scrutin. */
  guideSectionIds: string[];
  candidaciesNote: string;
  /** Date réelle de dernière vérification (ISO AAAA-MM-JJ) ; absente tant qu'aucune revue n'est datée. */
  lastVerified?: string;
}

export interface KeyFigure {
  label: string;
  value: string;
  source: Source;
}

export interface Theme {
  id: ThemeId;
  title: string;
  icon: string;
  /** Les enjeux : de quoi parle-t-on, pourquoi c'est débattu. */
  /** Deux phrases de 25 mots au plus ; le détail est dans `contextMore` (« En savoir plus »). */
  context: string;
  contextMore: string;
  keyFigures: KeyFigure[];
  /** Grandes options en débat, présentées sans hiérarchie. */
  debates: { question: string; options: string[] }[];
  /** Date réelle de dernière vérification (ISO) ; absente tant qu'aucune revue n'est datée. */
  lastVerified?: string;
}

export interface Question {
  id: string;
  theme: ThemeId;
  statement: string;
  /** 80 caractères au plus, rédigé comme l'affirmation : « Pour / Contre » garde le même sens. */
  shortLabel: string;
  /** Explication neutre pour qui ne connaît pas le sujet. */
  help: string;
  /** null : la question compte pour la proximité avec les partis, pas pour les axes. */
  axis: AxisId | null;
  /** +1 si « être d'accord » tire l'axe vers son pôle positif, -1 sinon. */
  direction: 1 | -1;
}

export interface Axis {
  id: AxisId;
  label: string;
  negativePole: string;
  positivePole: string;
}

export interface GuideBlock {
  heading: string;
  /** Texte visible. Une ligne « - … » dans un paragraphe est une puce. */
  paragraphs: string[];
  /** Détail derrière « En savoir plus » : articles, délais, exceptions. */
  more?: string[];
  sources: Source[];
}

/** Section pédagogique « Comprendre la politique française ». */
export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  blocks: GuideBlock[];
  /** Date réelle de dernière vérification (ISO) ; absente tant qu'aucune revue n'est datée. */
  lastVerified?: string;
}

/** Date déduite d'une règle (jamais annoncée telle quelle) : toujours présentée avec sa règle. */
export interface CalculatedDate {
  label: string;
  /** ISO 8601 (AAAA-MM-JJ). */
  date: string;
  /** Règle et texte source qui produisent la date. */
  rule: string;
  /** Heure limite éventuelle (HH:MM). */
  time?: string;
}

/** Terme du lexique de la politique française. */
export interface LexiconEntry {
  /** Identifiant stable, aussi ancre de la page (`/comprendre/lexique#<id>`). */
  id: string;
  term: string;
  /** Définition courte, visible. */
  definition: string;
  more: string[];
  /** Identifiants de leçons du guide. */
  related: string[];
  sources: Source[];
  lastVerified: string;
}

/** Question de la FAQ sur la présidentielle 2027. */
export interface FaqEntry {
  id: string;
  question: string;
  /** Réponse courte, visible (60 mots au plus). */
  answer: string;
  more?: string[];
  calculated?: CalculatedDate[];
  related: string[];
  sources: Source[];
  lastVerified: string;
}

export interface VoterSection {
  id: string;
  title: string;
  /** Une ligne « - … » devient une puce. */
  paragraphs: string[];
  more?: string[];
  calculated?: CalculatedDate[];
  sources: Source[];
}

/** Page « Comment voter » d'une élection : le détail de la leçon `guideSectionId`. */
export interface VoterGuide {
  id: string;
  title: string;
  summary: string;
  summarySources: Source[];
  guideSectionId: string;
  electionId: string;
  lastVerified: string;
  sections: VoterSection[];
}

/** Statut d'une candidature hors des dix partis suivis par le site. */
export type DeclaredCandidateStatus = 'declare' | 'intention' | 'investi' | 'designe';

/** Candidat déclaré publiquement et attesté par au moins deux sources (hors fiches de partis). */
export interface DeclaredCandidate {
  id: string;
  name: string;
  status: DeclaredCandidateStatus;
  /** Libellé uniforme (« Candidature déclarée »). */
  statusLabel: string;
  /** Date du statut (ISO AAAA-MM-JJ, ou AAAA-MM si seul le mois est établi). */
  date: string;
  /** Parti, mouvement ou « Sans étiquette ». */
  affiliation: string;
  /** Fonction, telle que décrite par les sources ; chaîne vide si aucune source n'en donne. */
  role: string;
  summary: string;
  sources: Source[];
}

export interface WithdrawnCandidate {
  id: string;
  name: string;
  /** Date du retrait (ISO AAAA-MM-JJ, ou AAAA-MM). */
  date: string;
  summary: string;
  sources: Source[];
}

/** Candidats déclarés d'une élection, hors partis suivis (fichier `elections/candidats-2027.json`). */
export interface ElectionCandidates {
  electionId: string;
  lastVerified: string;
  candidates: DeclaredCandidate[];
  withdrawn: WithdrawnCandidate[];
}

export interface Catalog {
  parties: Party[];
  elections: Election[];
  themes: Theme[];
  questions: Question[];
  axes: Axis[];
  guide: GuideSection[];
  /** Lexique, du premier au dernier terme dans l'ordre du fichier (l'ordre alphabétique est calculé). */
  lexicon: LexiconEntry[];
  /** Questions fréquentes sur la présidentielle 2027. */
  faq: FaqEntry[];
  /** Page « Comment voter » de la présidentielle 2027. */
  voter: VoterGuide;
  /** Autres candidats déclarés à la présidentielle 2027 (page « Les candidats »). */
  candidates: ElectionCandidates;
  /** Journal public des corrections, du plus récent au plus ancien. */
  corrections: CorrectionEntry[];
  /** Procédures judiciaires : un dossier par parti, ou aucun (tous ou aucun). */
  legal: LegalDossier[];
}
