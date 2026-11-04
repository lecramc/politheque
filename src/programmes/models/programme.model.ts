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
  | 'statistique'; // données publiques (INSEE, Cour des comptes, etc.)

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
  ideals: SourcedText[];
  timeline: HistoryEvent[];
  /** Pourquoi le parti a été créé : contexte et objectifs déclarés. */
  whyCreated?: SourcedText;
  /** Fondateurs et figures marquantes. */
  figures?: PartyFigure[];
  /** Courants de pensée, références intellectuelles et doctrinales. */
  thought?: SourcedText[];
}

/** Candidature d'un parti à une élection donnée, avec le programme présenté pour ce scrutin. */
export type CandidacyStatus = 'declare' | 'investi' | 'designe' | 'annonce' | 'pressenti';

export interface Candidacy {
  /** « Marine Le Pen » seul, pour les listes. */
  candidateName: string;
  status: CandidacyStatus;
  /** Libellé court et uniforme (« Candidat déclaré »). */
  statusLabel: string;
  /** Détail daté et sourcé du statut (dates, désignation, procédures) : affiché en feuille. */
  candidate: string;
  programmeStatus: string;
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
  context: string;
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
  paragraphs: string[];
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

export interface Catalog {
  parties: Party[];
  elections: Election[];
  themes: Theme[];
  questions: Question[];
  axes: Axis[];
  guide: GuideSection[];
}
