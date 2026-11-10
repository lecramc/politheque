import type {
  AssembleeManifest,
  Depute,
  DeputeDirectory,
  Groupe,
  ScrutinDetail,
  ScrutinIndex,
  ScrutinSummary,
} from '@/src/assemblee/models/scrutin.model';

export const scrutinFactory = (data: Partial<ScrutinSummary> = {}): ScrutinSummary => ({
  numero: 1,
  uid: 'VTANR5L17V1',
  date: '2025-03-10',
  type: 'SPS',
  categorie: 'texte',
  regles: ['R1', 'R2'],
  titre: "l'ensemble du projet de loi relatif à la simplification (première lecture).",
  adopte: true,
  demandeur: null,
  synthese: {
    votants: 4,
    exprimes: 3,
    requis: 2,
    pour: 2,
    contre: 1,
    abstentions: 1,
    nonVotants: 1,
    nonVotantsVolontaires: 0,
  },
  groupes: [],
  dossier: null,
  delegations: 0,
  misesAuPoint: 0,
  updatedAt: '2025-03-10',
  ...data,
});

export const groupeFactory = (data: Partial<Groupe> = {}): Groupe => ({
  organeRef: 'PO1',
  abrev: 'GA',
  libelle: 'Groupe A',
  couleurOfficielle: '#336699',
  medianePlace: 100,
  debut: '2024-07-18',
  fin: null,
  ...data,
});

export const deputeFactory = (data: Partial<Depute> = {}): Depute => ({
  id: 'PA1',
  civ: 'Mme',
  prenom: 'Anne',
  nom: 'Dupont',
  alpha: 'Dupont',
  departement: 'Nord',
  circonscription: 3,
  ...data,
});

export const detailFactory = (data: Partial<ScrutinDetail> = {}): ScrutinDetail => ({
  numero: 1,
  places: [],
  votes: '',
  deputes: [],
  groupes: [],
  delegations: [],
  misesAuPoint: [],
  sansPlace: [],
  ...data,
});

export const indexFactory = (data: Partial<ScrutinIndex> = {}): ScrutinIndex => ({
  groupes: [],
  scrutins: [],
  ...data,
});

export const directoryFactory = (deputes: Depute[] = []): DeputeDirectory => ({ deputes });

export const manifestFactory = (data: Partial<AssembleeManifest> = {}): AssembleeManifest => ({
  sources: { scrutins: 'https://example.test/scrutins.zip', amo: 'https://example.test/amo.zip' },
  licence: 'Licence Ouverte / Open Licence (Etalab)',
  extraitLe: '2026-11-10',
  publieLe: { scrutins: '2026-11-10', amo: '2026-11-10' },
  sha256: { scrutins: 'a'.repeat(64), amo: 'b'.repeat(64) },
  scrutins: 0,
  votes: 0,
  premier: '2024-10-08',
  dernier: '2026-11-04',
  versionScript: '1.0.0',
  regles: [],
  ...data,
});
