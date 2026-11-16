/** Forme des fichiers de l'open data de l'Assemblée nationale (17e législature), telle que lue. */

export type RawVotant = {
  acteurRef: string;
  mandatRef: string;
  parDelegation: 'true' | 'false';
  /** Numéro de place, zéros à gauche possibles ("080") ; parfois absent. */
  numPlace?: string | null;
  causePositionVote?: string | null;
};

/** `votant` est un tableau, ou un objet seul quand il n'y a qu'un élément ; la liste peut être null. */
export type RawVotantList = { votant?: RawVotant | RawVotant[] | null } | null | undefined;

export type RawDecompteVoix = {
  nonVotants: string;
  pour: string;
  contre: string;
  abstentions: string;
  nonVotantsVolontaires: string;
};

export type RawGroupVote = {
  organeRef: string;
  nombreMembresGroupe: string;
  vote: {
    positionMajoritaire?: string | null;
    decompteVoix: RawDecompteVoix;
    decompteNominatif: {
      nonVotants?: RawVotantList;
      pours?: RawVotantList;
      contres?: RawVotantList;
      abstentions?: RawVotantList;
    };
  };
};

/** Mise au point : chaque liste est null, un tableau de trous et de `{ votant }`, ou un objet. */
export type RawMiseAuPoint = {
  nonVotants?: unknown;
  pours?: unknown;
  contres?: unknown;
  abstentions?: unknown;
  nonVotantsVolontaires?: unknown;
  dysfonctionnement?: unknown;
} | null;

export type RawScrutin = {
  uid: string;
  numero: string;
  dateScrutin: string;
  typeVote: { codeTypeVote: string; libelleTypeVote?: string };
  sort: { code: string; libelle?: string };
  titre: string;
  demandeur?: { texte: string | null } | null;
  objet?: {
    libelle?: string;
    dossierLegislatif?: { libelle?: string; dossierRef: string } | null;
  } | null;
  syntheseVote: {
    nombreVotants: string;
    suffragesExprimes: string;
    nbrSuffragesRequis: string;
    decompte: RawDecompteVoix;
  };
  ventilationVotes: {
    organe: { groupes: { groupe: RawGroupVote | RawGroupVote[] } };
  };
  miseAuPoint?: RawMiseAuPoint;
};

export type RawMandat = {
  uid: string;
  legislature: string | null;
  typeOrgane: string;
  dateDebut: string | null;
  dateFin: string | null;
  organes?: { organeRef: string } | null;
  election?: { lieu?: { departement?: string | null; numCirco?: string | null } | null } | null;
  mandature?: { placeHemicycle?: string | null } | null;
};

export type RawActeur = {
  uid: { '#text': string };
  etatCivil: {
    ident: { civ: string; prenom: string; nom: string; alpha: string };
  };
  mandats?: { mandat?: RawMandat | RawMandat[] | null } | null;
};

export type RawOrgane = {
  uid: string;
  codeType: string;
  legislature?: string | null;
  libelle: string;
  libelleAbrev: string;
  couleurAssociee?: string | null;
  viMoDe: { dateDebut: string | null; dateFin: string | null };
};
