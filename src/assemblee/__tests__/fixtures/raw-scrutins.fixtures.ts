import type {
  RawDecompteVoix,
  RawGroupVote,
  RawScrutin,
  RawVotant,
} from '@/src/assemblee/models/extraction/raw.model';

/** Fixtures réduites : trois groupes (A, B, C) et quelques députés, forme fidèle à l'open data. */
export const GROUPE_A = 'PO100';
export const GROUPE_B = 'PO200';
export const GROUPE_C = 'PO300';

export const votant = (
  acteurRef: string,
  numPlace: string | null,
  parDelegation = false,
  extra: Partial<RawVotant> = {}
): RawVotant => ({
  acteurRef,
  mandatRef: `PM-${acteurRef}`,
  parDelegation: parDelegation ? 'true' : 'false',
  numPlace,
  ...extra,
});

const decompte = (p: Partial<Record<keyof RawDecompteVoix, number>>): RawDecompteVoix => ({
  pour: String(p.pour ?? 0),
  contre: String(p.contre ?? 0),
  abstentions: String(p.abstentions ?? 0),
  nonVotants: String(p.nonVotants ?? 0),
  nonVotantsVolontaires: String(p.nonVotantsVolontaires ?? 0),
});

type Lists = {
  pours?: RawVotant[];
  contres?: RawVotant[];
  abstentions?: RawVotant[];
  nonVotants?: RawVotant[];
};

/** Un seul votant → objet seul ; aucun → null ; sinon tableau (comme l'open data). */
const list = (votants: RawVotant[] | undefined) => {
  if (!votants || votants.length === 0) return null;
  return { votant: votants.length === 1 ? votants[0] : votants };
};

export const groupVote = (
  organeRef: string,
  membres: number,
  lists: Lists,
  position = 'pour'
): RawGroupVote => ({
  organeRef,
  nombreMembresGroupe: String(membres),
  vote: {
    positionMajoritaire: position,
    decompteVoix: decompte({
      pour: lists.pours?.length,
      contre: lists.contres?.length,
      abstentions: lists.abstentions?.length,
      nonVotants: lists.nonVotants?.length,
    }),
    decompteNominatif: {
      pours: list(lists.pours),
      contres: list(lists.contres),
      abstentions: list(lists.abstentions),
      nonVotants: list(lists.nonVotants),
    },
  },
});

type ScrutinOptions = {
  numero: number;
  date: string;
  type: 'SPO' | 'SPS' | 'MOC';
  titre: string;
  groupes: RawGroupVote[];
  requis?: number;
  adopte?: boolean;
  dossierRef?: string | null;
  miseAuPoint?: RawScrutin['miseAuPoint'];
};

export const rawScrutin = (o: ScrutinOptions): RawScrutin => {
  const sum = (k: keyof RawDecompteVoix) =>
    o.groupes.reduce((n, g) => n + Number(g.vote.decompteVoix[k]), 0);
  return {
    uid: `VTANR5L17V${o.numero}`,
    numero: String(o.numero),
    dateScrutin: o.date,
    typeVote: { codeTypeVote: o.type },
    sort: { code: o.adopte ? 'adopté' : 'rejeté' },
    titre: o.titre,
    demandeur: { texte: o.type === 'SPO' ? null : 'Conférence des Présidents' },
    objet: {
      libelle: o.titre,
      dossierLegislatif: o.dossierRef ? { libelle: 'Dossier', dossierRef: o.dossierRef } : null,
    },
    syntheseVote: {
      nombreVotants: String(sum('pour') + sum('contre') + sum('abstentions')),
      suffragesExprimes: String(sum('pour') + sum('contre')),
      nbrSuffragesRequis: String(o.requis ?? 3),
      decompte: decompte({
        pour: sum('pour'),
        contre: sum('contre'),
        abstentions: sum('abstentions'),
        nonVotants: sum('nonVotants'),
      }),
    },
    ventilationVotes: { organe: { groupes: { groupe: o.groupes } } },
    miseAuPoint: o.miseAuPoint ?? null,
  };
};

/**
 * SPS sur l'ensemble d'un projet de loi (apostrophe typographique), 2025-03-10.
 *  - dep1 (place 010, A) pour, par délégation ; dep2 (place 011, A) pour
 *  - dep3 (place 150, B) contre ; dep4 (place 151, B) abstention
 *  - dep5 (place 300, C) non-votant ; dep6 (place 301, C) en fonction mais absent de toutes les listes
 *  - mise au point : dep3 souhaitait voter pour ; place 400 vacante (aucun député)
 */
export const spsEnsemble = (): RawScrutin =>
  rawScrutin({
    numero: 10,
    date: '2025-03-10',
    type: 'SPS',
    titre: 'l’ensemble du projet de loi relatif à la simplification (première lecture).',
    adopte: true,
    requis: 2,
    dossierRef: 'DLR5L17N1',
    groupes: [
      groupVote(GROUPE_A, 2, {
        pours: [votant('dep1', '010', true), votant('dep2', '011')],
      }),
      groupVote(
        GROUPE_B,
        2,
        { contres: [votant('dep3', '150')], abstentions: [votant('dep4', '151')] },
        'contre'
      ),
      groupVote(
        GROUPE_C,
        2,
        { nonVotants: [votant('dep5', '300', false, { causePositionVote: 'PSE' })] },
        'non-votant'
      ),
    ],
    miseAuPoint: {
      nonVotants: [null, null],
      pours: [null, { votant: votant('dep3', '150') }],
      contres: null,
      abstentions: null,
      nonVotantsVolontaires: null,
    },
  });

/**
 * Motion de censure : seuls les « pour » sont recensés, 2025-04-02.
 * dep7 (remplaçant de dep2) siège à la place 011 ; dep9 siège à la place 400 (vacante le 10 mars) ;
 * dep6 a rejoint le groupe A ; dep3, dep4, dep5 et dep6 n'apparaissent dans aucune liste.
 */
export const motionCensure = (): RawScrutin =>
  rawScrutin({
    numero: 20,
    date: '2025-04-02',
    type: 'MOC',
    titre:
      "la motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution par M. Untel et 2 de leurs collègues.",
    requis: 289,
    groupes: [
      groupVote(GROUPE_A, 3, { pours: [votant('dep1', '010'), votant('dep7', '011')] }),
      groupVote(GROUPE_B, 3, { pours: [votant('dep9', '400')] }, 'pour'),
      groupVote(GROUPE_C, 1, {}, 'contre'),
    ],
  });

/** Scrutin public ordinaire sur un amendement : hors périmètre. */
export const spoAmendement = (): RawScrutin =>
  rawScrutin({
    numero: 30,
    date: '2025-03-11',
    type: 'SPO',
    titre: "l'amendement n° 12 de M. Untel après l'article 3 du projet de loi (première lecture).",
    groupes: [groupVote(GROUPE_A, 2, { pours: [votant('dep1', '010')] })],
  });

/** Scrutin public ordinaire sur l'article unique d'une proposition de loi : R4, inclus. */
export const spoArticleUniqueLoi = (): RawScrutin =>
  rawScrutin({
    numero: 40,
    date: '2025-03-12',
    type: 'SPO',
    titre: 'l’article unique de la proposition de loi visant à tester (première lecture).',
    groupes: [groupVote(GROUPE_A, 2, { pours: [votant('dep1', '010')] })],
  });

/** Article unique d'une résolution en scrutin ordinaire : hors périmètre (sauf si solennel). */
export const spoArticleUniqueResolution = (): RawScrutin =>
  rawScrutin({
    numero: 50,
    date: '2025-03-13',
    type: 'SPO',
    titre: "l'article unique de la proposition de résolution tendant à tester.",
    groupes: [groupVote(GROUPE_A, 2, { pours: [votant('dep1', '010')] })],
  });

/** Article unique d'une résolution mais scrutin solennel : inclus par R2, catégorie « résolution ». */
export const spsArticleUniqueResolution = (): RawScrutin =>
  rawScrutin({
    numero: 60,
    date: '2025-03-14',
    type: 'SPS',
    titre: "l'article unique de la proposition de résolution européenne appelant à tester.",
    groupes: [groupVote(GROUPE_A, 2, { pours: [votant('dep1', '010')] })],
  });
