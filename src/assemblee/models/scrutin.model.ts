/** Contrats de données du domaine « Assemblée » (open data de l'Assemblée nationale, 17e législature). */

/**
 * P pour, C contre, A abstention, N non-votant (liste officielle), '-' pas de vote enregistré
 * (député en fonction absent de toutes les listes), '.' siège vacant.
 */
export type VoteCode = 'P' | 'C' | 'A' | 'N' | '-' | '.';
export type ScrutinType = 'SPO' | 'SPS' | 'MOC';
export type ScrutinCategory =
  | 'texte'
  | 'resolution'
  | 'article-unique'
  | 'censure'
  | 'confiance'
  | 'declaration'
  | 'rejet-prealable'
  | 'partie-budget';
/** R1 ensemble d'un texte, R2 article unique, R3 censure, R4 déclaration du Gouvernement, R5 rejet préalable adopté, R6 partie de loi financière. */
export type ScrutinRule = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

export type Groupe = {
  organeRef: string;
  abrev: string;
  libelle: string;
  couleurOfficielle: string;
  /** Médiane des numéros de place des membres ayant voté : sert à ordonner les groupes. */
  medianePlace: number;
  debut: string;
  fin: string | null;
};

/** [indice du groupe, membres, pour, contre, abstentions, non-votants] */
export type GroupeDecompte = [
  groupeIdx: number,
  membres: number,
  pour: number,
  contre: number,
  abstentions: number,
  nonVotants: number,
];

export type ScrutinSynthese = {
  votants: number;
  exprimes: number;
  requis: number;
  pour: number;
  contre: number;
  abstentions: number;
  nonVotants: number;
  nonVotantsVolontaires: number;
};

export type ScrutinSummary = {
  numero: number;
  uid: string;
  date: string;
  type: ScrutinType;
  categorie: ScrutinCategory;
  regles: ScrutinRule[];
  /** Titre officiel, non réécrit. */
  titre: string;
  adopte: boolean;
  demandeur: string | null;
  synthese: ScrutinSynthese;
  /** Dans l'ordre des groupes de l'index (ordre des places, de gauche à droite de l'image). */
  groupes: GroupeDecompte[];
  dossier: { uid: string; url: string } | null;
  delegations: number;
  misesAuPoint: number;
  updatedAt: string;
};

export type ScrutinIndex = { groupes: Groupe[]; scrutins: ScrutinSummary[] };

export type MiseAuPoint = { depute: number; souhait: Exclude<VoteCode, '-' | '.'> };

/**
 * Député sans siège identifiable ce jour-là (aucune place libre connue) : son vote est conservé et
 * listé sous le schéma, jamais placé arbitrairement.
 */
export type SansPlace = {
  depute: number;
  groupe: number;
  vote: Exclude<VoteCode, '.'>;
  delegation: boolean;
};

export type ScrutinDetail = {
  numero: number;
  /** Numéros de place (occupées ou vacantes ce jour-là), ordre croissant. */
  places: number[];
  /** Un VoteCode par entrée de `places`. */
  votes: string;
  /** Indice dans deputes.json, -1 si siège vacant. */
  deputes: number[];
  /** Indice dans ScrutinIndex.groupes au jour du vote, -1 si siège vacant. */
  groupes: number[];
  /** Indices (dans `places`) des votes exprimés par délégation. */
  delegations: number[];
  misesAuPoint: MiseAuPoint[];
  sansPlace: SansPlace[];
  /** Cause officielle (`causePositionVote`) d'un non-votant : [indice du député, code]. PAN et PSE : présidence de séance ; MG : membre du Gouvernement. */
  causes: [depute: number, cause: string][];
};

export type Depute = {
  id: string;
  civ: string;
  prenom: string;
  nom: string;
  alpha: string;
  departement: string;
  circonscription: number;
};
export type DeputeDirectory = { deputes: Depute[] };

export type AssembleeManifest = {
  sources: { scrutins: string; amo: string };
  licence: string;
  extraitLe: string;
  publieLe: { scrutins: string | null; amo: string | null };
  sha256: { scrutins: string; amo: string };
  scrutins: number;
  votes: number;
  premier: string;
  dernier: string;
  versionScript: string;
  regles: string[];
};
