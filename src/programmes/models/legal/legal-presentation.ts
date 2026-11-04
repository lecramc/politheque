import { startOfPeriod } from '@/src/programmes/models/legal/legal-dates';
import { formatPenalty } from '@/src/programmes/models/legal/legal-penalties';
import {
  NON_FINAL_STATUSES,
  PRESUMPTION_NOTICE,
  STATUS_LABELS,
} from '@/src/programmes/models/legal/legal-vocabulary';
import type {
  IsoPartialDate,
  LegalCategory,
  LegalDossier,
  LegalEntry,
  PendingRemedy,
} from '@/src/programmes/models/legal/legal.model';
import type { Source } from '@/src/programmes/models/programme.model';
import { formatLongDate, formatPartialDate } from '@/src/programmes/models/seo/dates';

export const CATEGORY_LABELS: Record<LegalCategory, string> = {
  probite: 'Probité',
  'propos-discrimination': 'Propos et discrimination',
  violences: 'Violences',
  autres: 'Autres',
};

export type PresentedEntry = {
  id: string;
  anchor: string;
  /** `${person.name} · ${caseName}` */
  heading: string;
  roleAtTheTime: string;
  categoryLabel: string;
  offences: string;
  statusLabel: string;
  presumptionNotice: string | null;
  facts: string;
  steps: {
    date: string;
    court: string | null;
    decision: string;
    penalties: string[];
    sources: Source[];
  }[];
  nextStep: { text: string; sources: Source[] } | null;
  lastVerified: string;
  sources: Source[];
};

export type PresentedDossier = {
  reviewedOn: string;
  ongoing: PresentedEntry[];
  closed: PresentedEntry[];
  isEmpty: boolean;
};

/** Issues susceptibles d'être frappées d'un recours : l'entrée reste « en cours ». */
const APPEALABLE_CLOSED = new Set(['relaxe', 'acquittement', 'non-lieu']);

const isOngoing = (e: LegalEntry) =>
  NON_FINAL_STATUSES.has(e.status) || (APPEALABLE_CLOSED.has(e.status) && e.pendingRemedy !== null);

const REMEDY_LABEL: Record<PendingRemedy['kind'], string> = {
  appel: 'appel',
  'pourvoi-en-cassation': 'pourvoi en cassation',
  opposition: 'opposition',
  autre: 'recours',
};
const FILER_LABEL: Record<PendingRemedy['filedBy'], string> = {
  personne: ' de la personne mise en cause',
  parquet: ' du parquet',
  'partie-civile': ' de la partie civile',
  plusieurs: '',
};

function statusLabel(e: LegalEntry): string {
  const base = STATUS_LABELS[e.status];
  if (!APPEALABLE_CLOSED.has(e.status) || !e.pendingRemedy) return base;
  const { kind, filedBy } = e.pendingRemedy;
  return `${base} (${REMEDY_LABEL[kind]}${FILER_LABEL[filedBy]} en cours)`;
}

/** « le 12 mars 2027 », « en avril 2027 », « en 2027 ». */
function when(date: IsoPartialDate): string {
  const parts = date.split('-').length;
  return parts === 3 ? `le ${formatLongDate(date)}` : `en ${formatPartialDate(date)}`;
}

function nextStepText(next: NonNullable<LegalEntry['nextStep']>): string {
  const lead = {
    'date-fixee': 'Prévue',
    'au-plus-tard': 'Attendue au plus tard',
    annoncee: 'Annoncée pour',
  }[next.precision];
  const date = when(next.expected);
  // « Annoncée pour le 12 mars 2027 » mais « Annoncée pour avril 2027 » : pas de « en » après « pour ».
  return `${lead} ${next.precision === 'annoncee' ? date.replace(/^en /, '') : date} : ${next.label}`;
}

function factsText(e: LegalEntry): string {
  const { start, end } = e.facts;
  return end && end !== start
    ? `Faits de ${formatPartialDate(start)} à ${formatPartialDate(end)}`
    : `Faits ${when(start)}`;
}

function presentEntry(e: LegalEntry): PresentedEntry {
  return {
    id: e.id,
    anchor: e.id,
    heading: `${e.person.name} · ${e.caseName}`,
    roleAtTheTime: e.roleAtTheTime,
    categoryLabel: CATEGORY_LABELS[e.category],
    offences: e.offences.join(', '),
    statusLabel: statusLabel(e),
    presumptionNotice: isOngoing(e) ? PRESUMPTION_NOTICE : null,
    facts: factsText(e),
    steps: e.steps.map((s) => ({
      date: formatPartialDate(s.date),
      court: s.court ?? null,
      decision: s.decision,
      penalties: (s.penalties ?? []).map(formatPenalty),
      sources: s.sources,
    })),
    nextStep: e.nextStep ? { text: nextStepText(e.nextStep), sources: e.nextStep.sources } : null,
    lastVerified: formatLongDate(e.lastVerified),
    sources: e.sources,
  };
}

/** Le parti (personne morale) d'abord, puis les personnes par nom, puis par date des faits. */
function compareEntries(a: LegalEntry, b: LegalEntry): number {
  const rank = (e: LegalEntry) => (e.scope === 'parti' ? 0 : 1);
  return (
    rank(a) - rank(b) ||
    a.person.sortName.localeCompare(b.person.sortName, 'fr') ||
    startOfPeriod(a.facts.start).localeCompare(startOfPeriod(b.facts.start)) ||
    a.id.localeCompare(b.id)
  );
}

/** Même regroupement, même tri et même gabarit pour tous les partis : ni gravité, ni notoriété. */
export function presentDossier(dossier: LegalDossier): PresentedDossier {
  const sorted = [...dossier.entries].sort(compareEntries);
  return {
    reviewedOn: formatLongDate(dossier.reviewedOn),
    ongoing: sorted.filter(isOngoing).map(presentEntry),
    closed: sorted.filter((e) => !isOngoing(e)).map(presentEntry),
    isEmpty: dossier.entries.length === 0,
  };
}
