import { startOfPeriod } from '@/src/programmes/models/legal/legal-dates';
import type {
  IsoPartialDate,
  LegalEntry,
  LegalStatus,
  LegalStep,
  NextStep,
  PendingRemedy,
  Penalty,
  StepKind,
  StepOutcome,
} from '@/src/programmes/models/legal/legal.model';
import type { Source } from '@/src/programmes/models/programme.model';

/**
 * Entrée d'un brouillon `docs/affaires/<id>.json` (schéma « brouillon-2 », voir
 * `docs/affaires/SCHEMA.md`). Les notes de travail (rattachement, verification, casLimite,
 * avisJuridique…) n'ont pas d'équivalent publié : elles servent uniquement à la revue.
 */
export type BrouillonEntry = {
  id: string;
  affaire: string;
  personne: string;
  typePersonne: 'personne-physique' | 'personne-morale';
  scope: LegalEntry['scope'];
  fonctionAuMomentDesFaits: string;
  nature: 'penale' | 'civile-administrative';
  categorie: LegalEntry['category'];
  infraction: string;
  juridiction: string | null;
  datesFaits: string | null;
  dateDecision: string | null;
  peine: string | null;
  recours: string | null;
  statut: string;
  resume: string;
  prochaineEtape: { label: string; date: string; precision: NextStep['precision'] } | null;
  casLimite: string | null;
  sources: { title: string; url: string; date: string; kind: string }[];
  derniereVerification: string;
  libellePublic?: string;
  avisJuridique?: string[];
  /** Validation humaine d'un cas limite (`casLimite` non nul). */
  validationHumaine?: { by: string; on: string };
  /** Avis écrit de l'avocat sur les points de `avisJuridique`. */
  avisJuridiqueRendu?: { by: string; on: string };
};

/** Le texte de `statut` est libre dans le JSON : on ne présume de rien avant validation. */
export const STATUS_STEP: Record<LegalStatus, { kind: StepKind | 'court'; outcome: StepOutcome }> =
  {
    enquete: { kind: 'ouverture-enquete', outcome: null },
    'temoin-assiste': { kind: 'temoin-assiste', outcome: null },
    'mise-en-examen': { kind: 'mise-en-examen', outcome: null },
    'renvoi-devant-tribunal': { kind: 'renvoi', outcome: null },
    'proces-en-cours': { kind: 'renvoi', outcome: null },
    'condamnation-non-definitive': { kind: 'court', outcome: 'condamnation' },
    'condamnation-recours-non-documente': { kind: 'court', outcome: 'condamnation' },
    'condamnation-definitive': { kind: 'court', outcome: 'condamnation' },
    relaxe: { kind: 'court', outcome: 'relaxe' },
    acquittement: { kind: 'court', outcome: 'acquittement' },
    'non-lieu': { kind: 'non-lieu', outcome: null },
    classement: { kind: 'classement', outcome: null },
    'extinction-action-publique': { kind: 'extinction', outcome: null },
    'mise-en-examen-annulee': { kind: 'mise-en-examen', outcome: 'annulation' },
  };

const DATE_PART = String.raw`\d{4}(?:-\d{2}(?!\d)(?:-\d{2}(?!\d))?)?`;
const FACTS = new RegExp(`^(${DATE_PART})(?:\\s*(?:à|-|–)\\s*(${DATE_PART}))?`);

/** Années citées dans un texte libre ; « années 1990 » couvre 1990 à 1999. */
function loosePeriod(text: string): { start: string; end?: string } | null {
  const spans = [...text.matchAll(/(années\s+)?\b(\d{4})\b/gi)].map((m) => {
    const year = Number(m[2]);
    return m[1] && year % 10 === 0 ? [year, year + 9] : [year, year];
  });
  if (!spans.length) return null;
  const start = Math.min(...spans.map(([from]) => from));
  const end = Math.max(...spans.map(([, to]) => to));
  return { start: String(start), ...(end > start ? { end: String(end) } : {}) };
}

/**
 * « 2004-2016 », « 2017 (campagne) », « 2021-10 à 2022-09 (…) », « Années 1990 » → { start, end? }.
 * Aucune année dans la source : null (« date des faits non précisée »), jamais une date inventée.
 */
export function parseFacts(text: string | null): LegalEntry['facts'] | null {
  if (!text) return null;
  const exact = FACTS.exec(text.trim());
  if (exact) return { start: exact[1], ...(exact[2] ? { end: exact[2] } : {}) };
  return loosePeriod(stripParentheses(text)) ?? loosePeriod(text);
}

const PRESUMPTION_TAIL =
  /(?:\s*[;,]\s*|\s+et\s+|\s+)(?:(?:il|elle|le député|la députée)\s+)?(?:est|reste)\s+pr[ée]sum[ée]e?\s+innocente?(?:\s+(?:pour ces faits|jusqu['’]à[^.;]*))?/gi;
const GUILTY_BEFORE_NAME =
  /(déclar(?:é|ée|és|ées))\s+((?:[A-ZÀ-Ý][\p{L}'’-]*\s+){0,4}[A-ZÀ-Ý][\p{L}'’-]*)\s+(coupables?)\b/gu;

/**
 * Résumé du brouillon → texte public d'une étape. Le rappel de présomption d'innocence est
 * généré par le site (jamais écrit à la main) et « coupable » ne s'écrit que « déclaré coupable ».
 */
export function publicDecision(text: string): string {
  const withoutNotice = text
    .replace(/\s*\([^)]*pr[ée]somption[^)]*\)/gi, '')
    .replace(PRESUMPTION_TAIL, '')
    .split(/(?<=\.)\s+/)
    .filter((sentence) => !/^pr[ée]somption d['’]innocence\.?$/i.test(sentence))
    .join(' ');
  return withoutNotice
    .replace(/\s+([.,])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .replace(/\s*;\s*\./g, '.')
    .replace(/reconnu(e?s?)\s+coupable/gi, 'déclaré$1 coupable')
    .replace(GUILTY_BEFORE_NAME, '$1 $3 $2')
    .trim();
}

/** Les faits précèdent la décision : une période floue (« années 1990 ») s'arrête à l'année de la décision. */
export function clampFacts(
  facts: LegalEntry['facts'],
  decisionDate: IsoPartialDate
): LegalEntry['facts'] {
  if (!facts?.end || startOfPeriod(facts.end) <= startOfPeriod(decisionDate)) return facts;
  const year = decisionDate.slice(0, 4);
  const startYear = facts.start.slice(0, 4);
  if (startYear > year) return facts;
  return startYear === year ? { start: facts.start } : { start: facts.start, end: year };
}

/** « La personne X (parenthèse) » → « La personne X ». */
export const stripParentheses = (text: string) =>
  text
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const PARTICLES = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'd’', "d'", 'van', 'von']);

/** « Marine Le Pen » → « Le Pen Marine » ; une personne morale garde son nom. */
export function sortNameOf(name: string, kind: 'personne-physique' | 'personne-morale'): string {
  const words = name.split(/\s+/);
  if (kind === 'personne-morale' || words.length < 2) return name;
  let start = words.length - 1;
  while (start > 1 && PARTICLES.has(words[start - 1].toLowerCase())) start -= 1;
  return [...words.slice(start), ...words.slice(0, start)].join(' ');
}

const lastSegment = (juridiction: string | null) =>
  juridiction ? stripParentheses(juridiction.split(';').pop() ?? '') : '';

function stepKindFor(status: LegalStatus, court: string): StepKind {
  const { kind } = STATUS_STEP[status];
  if (kind !== 'court') return kind;
  if (/cassation/i.test(court)) return 'arret-cassation';
  if (/appel/i.test(court)) return 'arret-appel';
  return 'jugement';
}

export function convertSources(sources: BrouillonEntry['sources']): Source[] {
  return sources.map((s) => ({
    title: s.title,
    url: s.url,
    date: s.date,
    // `statistique` = décision de justice ou source officielle dans les brouillons.
    kind: (s.kind === 'statistique' ? 'justice' : s.kind) as Source['kind'],
  }));
}

/** Date de l'étape : la décision ; à défaut le mois de la plus ancienne source, jamais avant les faits. */
function stepDate(e: BrouillonEntry, facts: LegalEntry['facts']): IsoPartialDate {
  // Dates de sources de précision variable : on préfère le jour ou le mois à une simple année.
  const dates = e.sources.map((s) => s.date).filter((d): d is string => typeof d === 'string');
  const precise = dates.filter((d) => d.length >= 7).map((d) => d.slice(0, 7));
  const earliest = [...(precise.length ? precise : dates)].sort()[0];
  if (e.dateDecision) return e.dateDecision;
  const candidate = earliest ?? e.derniereVerification;
  const factsEnd = facts?.end ?? facts?.start;
  return factsEnd && startOfPeriod(candidate) < startOfPeriod(factsEnd) ? factsEnd : candidate;
}

function remedyFrom(text: string | null): PendingRemedy {
  const lower = (text ?? '').toLowerCase();
  const kind: PendingRemedy['kind'] = /pourvoi/.test(lower)
    ? 'pourvoi-en-cassation'
    : /appel/.test(lower)
      ? 'appel'
      : 'autre';
  return { kind, filedBy: 'plusieurs' };
}

export function convertNextStep(next: BrouillonEntry['prochaineEtape']): NextStep | null {
  return next
    ? { label: next.label, expected: next.date, precision: next.precision, sources: [] }
    : null;
}

/** Brouillon → entrée publiable, ou liste de manques si une donnée structurelle est absente. */
export function convertBrouillonEntry(
  e: BrouillonEntry,
  status: LegalStatus
): { ok: true; entry: LegalEntry } | { ok: false; errors: string[] } {
  const parsedFacts = parseFacts(e.datesFaits);
  const court = lastSegment(e.juridiction);
  const date = stepDate(e, parsedFacts);
  const facts = clampFacts(parsedFacts, date);
  const sources = convertSources(e.sources);
  const penalties: Penalty[] =
    STATUS_STEP[status].outcome === 'condamnation' && e.peine
      ? [{ kind: 'autre', label: e.peine }]
      : [];
  const step: LegalStep = {
    date,
    kind: stepKindFor(status, court),
    ...(court ? { court } : {}),
    decision: publicDecision(e.resume),
    outcome: STATUS_STEP[status].outcome,
    ...(penalties.length ? { penalties } : {}),
    sources,
  };
  const name = stripParentheses(e.personne);
  const entry: LegalEntry = {
    id: e.id,
    caseName: e.affaire,
    person: { name, sortName: sortNameOf(name, e.typePersonne), kind: e.typePersonne },
    scope: e.scope,
    roleAtTheTime: e.fonctionAuMomentDesFaits,
    category: e.categorie,
    offences: e.infraction
      .split(';')
      .map((o) => o.trim())
      .filter(Boolean),
    facts,
    status,
    steps: [step],
    pendingRemedy: status === 'condamnation-non-definitive' ? remedyFrom(e.recours) : null,
    nextStep: convertNextStep(e.prochaineEtape),
    sources,
    lastVerified: e.derniereVerification,
    ...(e.nature === 'civile-administrative' ? { nature: 'civile-administrative' as const } : {}),
    ...(e.libellePublic ? { publicLabel: e.libellePublic } : {}),
  };
  return { ok: true, entry };
}
