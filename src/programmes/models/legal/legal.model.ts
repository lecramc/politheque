import type { Source } from '@/src/programmes/models/programme.model';

/** AAAA-MM-JJ */
export type IsoDay = string;
/** AAAA, AAAA-MM ou AAAA-MM-JJ (précision réelle de la source, jamais inventée). */
export type IsoPartialDate = string;

export const LEGAL_STATUSES = [
  'enquete', // préliminaire ou information judiciaire visant nommément la personne
  'temoin-assiste',
  'mise-en-examen',
  'renvoi-devant-tribunal',
  'proces-en-cours',
  'condamnation-non-definitive', // appel ou pourvoi en cours
  'condamnation-recours-non-documente', // condamnation connue, aucune trace d'un recours (brief § 9.1)
  'condamnation-definitive',
  'relaxe',
  'acquittement',
  'non-lieu',
  'classement',
  'extinction-action-publique', // décès, prescription
  'mise-en-examen-annulee', // annulée par une juridiction, sans non-lieu (brief § 7.3)
  'demande-rejetee', // décision civile favorable à la personne, ex. déboutement (brief § 10.3)
] as const;
/** Statut juridique exact, liste fermée (brief § 2, D-A4). */
export type LegalStatus = (typeof LEGAL_STATUSES)[number];

export const LEGAL_CATEGORIES = [
  'probite',
  'propos-discrimination',
  'violences',
  'autres',
] as const;
export type LegalCategory = (typeof LEGAL_CATEGORIES)[number];

/** Pourquoi la personne entre dans le périmètre (brief § 1). */
export const PERSON_SCOPES = [
  'parti', // personne morale : parti, micro-parti, association de financement
  'dirigeant', // fondateur, président, secrétaire national, porte-parole national
  'candidat-presidentielle',
  'parlementaire',
  'ministre',
] as const;
export type PersonScope = (typeof PERSON_SCOPES)[number];

export interface LegalPerson {
  /** « Marine Le Pen », « Front national (personne morale) ». */
  name: string;
  /** Clé de tri : nom de famille puis prénom (« Le Pen Marine ») ; nom de l'entité pour une personne morale. */
  sortName: string;
  kind: 'personne-physique' | 'personne-morale';
  /** Seulement si la donnée est établie ; sinon formulations épicènes. */
  gender?: 'f' | 'm';
}

export type Penalty =
  | { kind: 'prison'; months: number; suspendedMonths: number; arrangement?: string }
  | { kind: 'amende'; euros: number; suspendedEuros?: number }
  | { kind: 'ineligibilite'; months: number; provisionalExecution: boolean }
  | { kind: 'autre'; label: string };

export const STEP_KINDS = [
  'ouverture-enquete',
  'information-judiciaire',
  'temoin-assiste',
  'mise-en-examen',
  'renvoi',
  'jugement',
  'arret-appel',
  'arret-cassation',
  'non-lieu',
  'classement',
  'recours', // appel / pourvoi formé
  'extinction',
] as const;
export type StepKind = (typeof STEP_KINDS)[number];

export const STEP_OUTCOMES = [
  'condamnation',
  'relaxe',
  'acquittement',
  'annulation',
  'rejet',
] as const;
export type StepOutcome = (typeof STEP_OUTCOMES)[number] | null;

export interface LegalStep {
  date: IsoPartialDate;
  kind: StepKind;
  /** « Tribunal correctionnel de Paris », « Cour d'appel de Paris », « Cour de cassation ». */
  court?: string;
  /** Une phrase factuelle, termes de la décision : « déclarée coupable de détournement de fonds publics ». */
  decision: string;
  /** Obligatoire (non nul) pour jugement / arret-*. */
  outcome: StepOutcome;
  /** Seulement si outcome === 'condamnation'. */
  penalties?: Penalty[];
  /** Au moins une par étape. */
  sources: Source[];
}

export const REMEDY_KINDS = ['appel', 'pourvoi-en-cassation', 'opposition', 'autre'] as const;
export const REMEDY_FILERS = ['personne', 'parquet', 'partie-civile', 'plusieurs'] as const;

export interface PendingRemedy {
  kind: (typeof REMEDY_KINDS)[number];
  filedBy: (typeof REMEDY_FILERS)[number];
  filedOn?: IsoPartialDate;
}

export const NEXT_STEP_PRECISIONS = ['date-fixee', 'au-plus-tard', 'annoncee'] as const;

export interface NextStep {
  /** « Décision de la Cour de cassation sur le pourvoi ». */
  label: string;
  expected: IsoPartialDate;
  precision: (typeof NEXT_STEP_PRECISIONS)[number];
  sources: Source[];
}

export interface LegalEntry {
  /** Slug stable, unique dans tout le site : `assistants-parlementaires-fn-le-pen-marine`. Ancre HTML. */
  id: string;
  /** Dénomination usuelle neutre : « Assistants parlementaires du FN au Parlement européen ». */
  caseName: string;
  person: LegalPerson;
  scope: PersonScope;
  /** Fonction au moment des faits : « présidente du Front national, députée européenne ». */
  roleAtTheTime: string;
  category: LegalCategory;
  /** Qualifications pénales, termes du code pénal : « détournement de fonds publics ». */
  offences: string[];
  /** null : la source ne donne aucune année (jamais une date inventée). */
  facts: { start: IsoPartialDate; end?: IsoPartialDate } | null;
  status: LegalStatus;
  /** Chronologiques, la dernière étape porte l'issue courante. */
  steps: LegalStep[];
  pendingRemedy: PendingRemedy | null;
  nextStep: NextStep | null;
  /** Sources générales de l'entrée (en plus de celles des étapes). */
  sources: Source[];
  lastVerified: IsoDay;
  /** Décision civile ou administrative : jamais présentée comme une condamnation pénale. */
  nature?: 'civile-administrative';
  /** Libellé d'état validé par l'éditeur (ex. « dernière information publique : … »). */
  publicLabel?: string;
}

export interface LegalDossier {
  partyId: string;
  /** Date à laquelle le recensement complet (exhaustivité, brief § 1) a été arrêté. Affichée. */
  reviewedOn: IsoDay;
  entries: LegalEntry[];
}
