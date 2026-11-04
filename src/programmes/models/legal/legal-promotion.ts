import {
  convertBrouillonEntry,
  type BrouillonEntry,
} from '@/src/programmes/models/legal/legal-brouillon';
import {
  validateLegalDossier,
  type LegalValidationContext,
} from '@/src/programmes/models/legal/legal-validation';
import {
  LEGAL_STATUSES,
  type IsoDay,
  type LegalDossier,
  type LegalEntry,
  type LegalStatus,
  type LegalStep,
  type NextStep,
  type Penalty,
} from '@/src/programmes/models/legal/legal.model';
import type { Source } from '@/src/programmes/models/programme.model';

type Validation = { by: string; on: IsoDay };

export type DraftReview = {
  decision: 'retenu' | 'non-retenu' | 'cas-limite';
  /** Obligatoire si non-retenu ou cas-limite. */
  reason?: string;
  /** Obligatoire pour publier un cas-limite. */
  humanValidation?: Validation;
};
export type DraftEntry = LegalEntry & { review: DraftReview };
export type LegalDraft = {
  partyId: string;
  reviewedOn: IsoDay;
  /** Vérification croisée indépendante. */
  crossCheck: Validation | null;
  /** Validation humaine du dossier. */
  humanValidation: Validation | null;
  entries: DraftEntry[];
};

export type PromotionResult =
  | { ok: true; dossier: LegalDossier; dropped: { id: string; reason: string }[] }
  | { ok: false; errors: string[] };

type Rec = Record<string, unknown>;
const isRecord = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isValidation = (value: unknown): value is Validation =>
  isRecord(value) && typeof value.by === 'string' && !!value.by && typeof value.on === 'string';

// Les copies ci-dessous ne reprennent que les champs du contrat : rien d'autre n'atteint src/.
const pickSource = (s: Source): Source => ({
  title: s.title,
  url: s.url,
  date: s.date,
  kind: s.kind,
});

function pickPenalty(p: Penalty): Penalty {
  switch (p.kind) {
    case 'prison':
      return {
        kind: 'prison',
        months: p.months,
        suspendedMonths: p.suspendedMonths,
        ...(p.arrangement ? { arrangement: p.arrangement } : {}),
      };
    case 'amende':
      return {
        kind: 'amende',
        euros: p.euros,
        ...(p.suspendedEuros !== undefined ? { suspendedEuros: p.suspendedEuros } : {}),
      };
    case 'ineligibilite':
      return {
        kind: 'ineligibilite',
        months: p.months,
        provisionalExecution: p.provisionalExecution,
      };
    case 'autre':
      return { kind: 'autre', label: p.label };
  }
}

const pickStep = (s: LegalStep): LegalStep => ({
  date: s.date,
  kind: s.kind,
  ...(s.court ? { court: s.court } : {}),
  decision: s.decision,
  outcome: s.outcome,
  ...(s.penalties ? { penalties: s.penalties.map(pickPenalty) } : {}),
  sources: s.sources.map(pickSource),
});

const pickNextStep = (n: NextStep): NextStep => ({
  label: n.label,
  expected: n.expected,
  precision: n.precision,
  sources: n.sources.map(pickSource),
});

const pickEntry = (e: LegalEntry): LegalEntry => ({
  id: e.id,
  caseName: e.caseName,
  person: {
    name: e.person.name,
    sortName: e.person.sortName,
    kind: e.person.kind,
    ...(e.person.gender ? { gender: e.person.gender } : {}),
  },
  scope: e.scope,
  roleAtTheTime: e.roleAtTheTime,
  category: e.category,
  offences: [...e.offences],
  facts: e.facts ? { start: e.facts.start, ...(e.facts.end ? { end: e.facts.end } : {}) } : null,
  status: e.status,
  steps: e.steps.map(pickStep),
  pendingRemedy: e.pendingRemedy
    ? {
        kind: e.pendingRemedy.kind,
        filedBy: e.pendingRemedy.filedBy,
        ...(e.pendingRemedy.filedOn ? { filedOn: e.pendingRemedy.filedOn } : {}),
      }
    : null,
  nextStep: e.nextStep ? pickNextStep(e.nextStep) : null,
  sources: e.sources.map(pickSource),
  lastVerified: e.lastVerified,
  ...(e.nature ? { nature: e.nature } : {}),
  ...(e.publicLabel ? { publicLabel: e.publicLabel } : {}),
});

/**
 * Brouillon `docs/affaires/<id>.json` → dossier publiable. Refus du fichier entier au moindre
 * manquement (pas d'écart silencieux) ; les noms des valideurs restent dans `docs/`.
 */
export function promoteDraft(raw: unknown, ctx: LegalValidationContext): PromotionResult {
  if (!isRecord(raw)) return { ok: false, errors: ['brouillon : objet attendu'] };
  if (raw.schemaVersion === 'brouillon-2') return promoteBrouillon(raw, ctx);
  const errors: string[] = [];
  if (!isValidation(raw.crossCheck))
    errors.push('crossCheck manquant (vérification croisée indépendante)');
  if (!isValidation(raw.humanValidation))
    errors.push('humanValidation manquant (validation humaine)');
  if (!Array.isArray(raw.entries))
    return { ok: false, errors: [...errors, 'entries : liste attendue'] };

  const kept: Rec[] = [];
  const dropped: { id: string; reason: string }[] = [];
  raw.entries.forEach((entry: unknown, index) => {
    const id = isRecord(entry) && typeof entry.id === 'string' ? entry.id : `entries[${index}]`;
    const review = isRecord(entry) ? entry.review : undefined;
    if (!isRecord(entry) || !isRecord(review)) {
      errors.push(`${id} : bloc review manquant`);
      return;
    }
    const reason = typeof review.reason === 'string' ? review.reason : '';
    switch (review.decision) {
      case 'retenu':
        break;
      case 'non-retenu':
        if (!reason) errors.push(`${id} : non-retenu sans raison`);
        dropped.push({ id, reason });
        return;
      case 'cas-limite':
        if (!reason) errors.push(`${id} : cas-limite sans raison`);
        if (!isValidation(review.humanValidation))
          errors.push(
            `${id} : cas-limite sans validation humaine explicite (review.humanValidation)`
          );
        break;
      default:
        errors.push(`${id} : review.decision inconnue`);
        return;
    }
    const { review: _review, ...published } = entry;
    kept.push(published);
  });
  if (errors.length) return { ok: false, errors };

  const candidate = { partyId: raw.partyId, reviewedOn: raw.reviewedOn, entries: kept };
  const issues = validateLegalDossier(candidate, ctx);
  if (issues.length) {
    return {
      ok: false,
      errors: issues.map((i) => `${i.entryId ?? 'dossier'} [${i.rule}] ${i.field} : ${i.detail}`),
    };
  }
  const dossier: LegalDossier = {
    partyId: candidate.partyId as string,
    reviewedOn: candidate.reviewedOn as string,
    entries: (kept as unknown as LegalEntry[])
      .map(pickEntry)
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
  return { ok: true, dossier, dropped };
}

const hasItems = (value: unknown) => Array.isArray(value) && value.length > 0;

/**
 * Brouillon « brouillon-2 » (`docs/affaires/SCHEMA.md`) → dossier publiable. Seules les `entries`
 * sont publiées (`aRecouper`, `nonRetenu`, `aTransferer`, `renvois` restent des notes de travail).
 * Trois validations humaines distinctes, jamais présumées : vérification croisée et validation du
 * dossier (enveloppe), validation d'un cas limite et avis juridique rendu (entrée). `libellePublic`
 * devient `publicLabel` ; `avisJuridique` et `casLimite` ne sont jamais publiés.
 */
function promoteBrouillon(raw: Rec, ctx: LegalValidationContext): PromotionResult {
  const errors: string[] = [];
  if (!isValidation(raw.crossCheck))
    errors.push('crossCheck manquant (vérification croisée indépendante)');
  if (!isValidation(raw.humanValidation))
    errors.push('humanValidation manquant (validation humaine du dossier)');
  if (!Array.isArray(raw.entries))
    return { ok: false, errors: [...errors, 'entries : liste attendue'] };

  const converted: LegalEntry[] = [];
  raw.entries.forEach((item: unknown, index) => {
    if (!isRecord(item)) {
      errors.push(`entries[${index}] : objet attendu`);
      return;
    }
    const e = item as unknown as BrouillonEntry;
    const id = typeof e.id === 'string' ? e.id : `entries[${index}]`;
    if (!(LEGAL_STATUSES as readonly string[]).includes(e.statut)) {
      errors.push(`${id} : statut non publiable (${String(e.statut)})`);
      return;
    }
    if (isRecord(item.verification) && item.verification.niveau !== 'recoupee')
      errors.push(`${id} : entrée à recouper (verification.niveau)`);
    if (e.casLimite && !isValidation(e.validationHumaine))
      errors.push(`${id} : cas limite sans validation humaine explicite (validationHumaine)`);
    if (hasItems(e.avisJuridique) && !isValidation(e.avisJuridiqueRendu))
      errors.push(`${id} : avis juridique non rendu (avisJuridiqueRendu)`);
    const result = convertBrouillonEntry(e, e.statut as LegalStatus);
    if (result.ok) converted.push(result.entry);
    else errors.push(...result.errors);
  });
  const candidate = { partyId: raw.partyId, reviewedOn: raw.dateRecherche, entries: converted };
  // Le validateur tourne même si une validation humaine manque : la liste d'erreurs est complète.
  const issues = validateLegalDossier(candidate, ctx).map(
    (i) => `${i.entryId ?? 'dossier'} [${i.rule}] ${i.field} : ${i.detail}`
  );
  if (errors.length || issues.length) return { ok: false, errors: [...errors, ...issues] };
  return {
    ok: true,
    dossier: {
      partyId: candidate.partyId as string,
      reviewedOn: candidate.reviewedOn as string,
      entries: converted.map(pickEntry).sort((a, b) => a.id.localeCompare(b.id)),
    },
    dropped: [],
  };
}
