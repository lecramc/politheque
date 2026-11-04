import {
  validateLegalDossier,
  type LegalValidationContext,
} from '@/src/programmes/models/legal/legal-validation';
import type {
  IsoDay,
  LegalDossier,
  LegalEntry,
  LegalStep,
  NextStep,
  Penalty,
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
  person: { name: e.person.name, sortName: e.person.sortName, kind: e.person.kind },
  scope: e.scope,
  roleAtTheTime: e.roleAtTheTime,
  category: e.category,
  offences: [...e.offences],
  facts: { start: e.facts.start, ...(e.facts.end ? { end: e.facts.end } : {}) },
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
});

/**
 * Brouillon `docs/affaires/<id>.json` → dossier publiable. Refus du fichier entier au moindre
 * manquement (pas d'écart silencieux) ; les noms des valideurs restent dans `docs/`.
 */
export function promoteDraft(raw: unknown, ctx: LegalValidationContext): PromotionResult {
  if (!isRecord(raw)) return { ok: false, errors: ['brouillon : objet attendu'] };
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
