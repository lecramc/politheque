import {
  EVALUATIVE_TERMS,
  findTerms,
  hasIsoDate,
  hasWorkNote,
} from '@/src/programmes/models/editorial-vocabulary';
import {
  endOfPeriod,
  isValidPartialDate,
  startOfPeriod,
} from '@/src/programmes/models/legal/legal-dates';
import {
  FORBIDDEN_LEGAL_TERMS,
  HAND_WRITTEN_PRESUMPTION,
  hasBareGuilty,
} from '@/src/programmes/models/legal/legal-vocabulary';
import {
  LEGAL_CATEGORIES,
  LEGAL_STATUSES,
  NEXT_STEP_PRECISIONS,
  PERSON_SCOPES,
  REMEDY_FILERS,
  REMEDY_KINDS,
  STEP_KINDS,
  STEP_OUTCOMES,
  type IsoDay,
  type LegalEntry,
  type Penalty,
} from '@/src/programmes/models/legal/legal.model';
import { SOURCE_KINDS, type Source } from '@/src/programmes/models/programme.model';
import { domainOf } from '@/src/programmes/models/verification.service';

export type LegalIssue = { entryId: string | null; field: string; rule: string; detail: string };

export type LegalValidationContext = { today: IsoDay; partyIds: readonly string[] };

/** Sources qui ne viennent pas du parti : presse nationale ou décision de justice. */
const INDEPENDENT_LEGAL_KINDS = new Set(['presse', 'justice']);
const MIN_INDEPENDENT_DOMAINS = 2;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FULL_DAY = /^\d{4}-\d{2}-\d{2}$/;

type Rec = Record<string, unknown>;
const isRecord = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);
const isPositiveInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

class Collector {
  issues: LegalIssue[] = [];
  constructor(public entryId: string | null = null) {}
  add(rule: string, field: string, detail: string) {
    this.issues.push({ entryId: this.entryId, field, rule, detail });
  }
}

function checkSourceShape(c: Collector, source: unknown, field: string): source is Source {
  if (!isRecord(source)) {
    c.add('forme', field, 'source attendue (objet)');
    return false;
  }
  let ok = true;
  for (const key of ['title', 'url', 'date'] as const) {
    if (!isText(source[key])) {
      c.add('forme', `${field}.${key}`, 'texte attendu');
      ok = false;
    }
  }
  if (!isOneOf(SOURCE_KINDS, source.kind)) {
    c.add('forme', `${field}.kind`, `nature de source inconnue : ${String(source.kind)}`);
    ok = false;
  }
  return ok;
}

function checkSourceList(c: Collector, list: unknown, field: string): Source[] {
  if (!Array.isArray(list)) {
    c.add('forme', field, 'liste de sources attendue');
    return [];
  }
  return list.filter((s, i) => checkSourceShape(c, s, `${field}[${i}]`));
}

function checkSourceContent(c: Collector, source: Source, field: string) {
  if (!/^https:\/\//.test(source.url))
    c.add('sources', field, `URL en https attendue : ${source.url}`);
  if (source.title.trim().length <= 3) c.add('sources', field, 'titre de source trop court');
  if (!isValidPartialDate(source.date))
    c.add('sources', field, `date de source non ISO : ${source.date}`);
}

/** Forme d'une entrée (JSON non typé). Retourne false si la suite n'est pas évaluable. */
function checkEntryShape(c: Collector, e: Rec): boolean {
  const before = c.issues.length;
  for (const key of ['id', 'caseName', 'roleAtTheTime'] as const) {
    if (!isText(e[key])) c.add('forme', key, 'texte attendu');
  }
  if (isRecord(e.person)) {
    if (!isText(e.person.name)) c.add('forme', 'person.name', 'texte attendu');
    if (!isText(e.person.sortName)) c.add('forme', 'person.sortName', 'texte attendu');
    if (!isOneOf(['personne-physique', 'personne-morale'], e.person.kind))
      c.add('forme', 'person.kind', 'personne-physique ou personne-morale attendu');
  } else c.add('forme', 'person', 'objet attendu');
  if (!isOneOf(PERSON_SCOPES, e.scope)) c.add('forme', 'scope', 'périmètre inconnu');
  if (!isOneOf(LEGAL_CATEGORIES, e.category)) c.add('forme', 'category', 'catégorie inconnue');
  if (!Array.isArray(e.offences) || !e.offences.length || !e.offences.every(isText))
    c.add('forme', 'offences', 'au moins une qualification pénale (texte) attendue');
  if (
    e.facts !== null &&
    (!isRecord(e.facts) ||
      !isText(e.facts.start) ||
      (e.facts.end !== undefined && !isText(e.facts.end)))
  )
    c.add('forme', 'facts', 'null ou { start, end? } attendu');
  if (e.status === undefined || !isOneOf(LEGAL_STATUSES, e.status))
    c.add('statut', 'status', `statut absent ou hors de la liste fermée : ${String(e.status)}`);
  if (!isText(e.lastVerified)) c.add('forme', 'lastVerified', 'date de vérification attendue');

  if (!Array.isArray(e.steps) || !e.steps.length) {
    c.add('forme', 'steps', 'au moins une étape attendue');
  } else {
    e.steps.forEach((s, i) => {
      const f = `steps[${i}]`;
      if (!isRecord(s)) return c.add('forme', f, 'objet attendu');
      if (!isText(s.date)) c.add('forme', `${f}.date`, 'texte attendu');
      if (!isOneOf(STEP_KINDS, s.kind)) c.add('forme', `${f}.kind`, 'type d’étape inconnu');
      if (s.court !== undefined && !isText(s.court)) c.add('forme', `${f}.court`, 'texte attendu');
      if (!isText(s.decision)) c.add('forme', `${f}.decision`, 'texte attendu');
      if (s.outcome !== null && !isOneOf(STEP_OUTCOMES, s.outcome))
        c.add('forme', `${f}.outcome`, 'issue attendue (ou null)');
      if (s.penalties !== undefined && !Array.isArray(s.penalties))
        c.add('forme', `${f}.penalties`, 'liste attendue');
      if (!Array.isArray(s.sources)) c.add('forme', `${f}.sources`, 'liste attendue');
    });
  }
  if (e.pendingRemedy !== null) {
    if (
      !isRecord(e.pendingRemedy) ||
      !isOneOf(REMEDY_KINDS, e.pendingRemedy.kind) ||
      !isOneOf(REMEDY_FILERS, e.pendingRemedy.filedBy)
    )
      c.add('forme', 'pendingRemedy', 'null ou { kind, filedBy, filedOn? } attendu');
  }
  if (e.nextStep !== null) {
    if (
      !isRecord(e.nextStep) ||
      !isText(e.nextStep.label) ||
      !isText(e.nextStep.expected) ||
      !isOneOf(NEXT_STEP_PRECISIONS, e.nextStep.precision) ||
      !Array.isArray(e.nextStep.sources)
    )
      c.add('forme', 'nextStep', 'null ou { label, expected, precision, sources } attendu');
  }
  if (!Array.isArray(e.sources)) c.add('forme', 'sources', 'liste de sources attendue');
  return c.issues.length === before;
}

function checkPenalty(c: Collector, p: Penalty, field: string) {
  const bad = (detail: string) => c.add('peines', field, detail);
  switch (p.kind) {
    case 'prison':
      if (!isPositiveInt(p.months)) bad('durée de prison : entier positif de mois attendu');
      if (
        !Number.isInteger(p.suspendedMonths) ||
        p.suspendedMonths < 0 ||
        p.suspendedMonths > p.months
      )
        bad('part avec sursis : entier de 0 au total des mois attendu');
      break;
    case 'amende':
      if (!isPositiveInt(p.euros)) bad('amende : entier positif d’euros attendu');
      if (
        p.suspendedEuros !== undefined &&
        (!Number.isInteger(p.suspendedEuros) || p.suspendedEuros < 0 || p.suspendedEuros > p.euros)
      )
        bad('part avec sursis de l’amende : entier de 0 au total attendu');
      break;
    case 'ineligibilite':
      if (!isPositiveInt(p.months)) bad('inéligibilité : entier positif de mois attendu');
      if (typeof p.provisionalExecution !== 'boolean')
        bad('exécution provisoire : booléen attendu');
      break;
    case 'autre':
      if (!isText(p.label)) bad('libellé de la peine attendu');
      break;
    default:
      bad('type de peine inconnu');
  }
}

/** Champs texte contrôlés pour le vocabulaire : (champ, texte). */
function textFields(e: LegalEntry): [string, string][] {
  const fields: [string, string][] = [
    ['caseName', e.caseName],
    ['roleAtTheTime', e.roleAtTheTime],
    ...e.offences.map((o, i): [string, string] => [`offences[${i}]`, o]),
  ];
  e.steps.forEach((s, i) => {
    if (s.court) fields.push([`steps[${i}].court`, s.court]);
    fields.push([`steps[${i}].decision`, s.decision]);
    (s.penalties ?? []).forEach((p, j) => {
      const text = p.kind === 'autre' ? p.label : p.kind === 'prison' ? p.arrangement : undefined;
      if (text) fields.push([`steps[${i}].penalties[${j}]`, text]);
    });
  });
  if (e.nextStep) fields.push(['nextStep.label', e.nextStep.label]);
  return fields;
}

const FORBIDDEN = [...new Set([...EVALUATIVE_TERMS, ...FORBIDDEN_LEGAL_TERMS])];

function checkVocabulary(c: Collector, e: LegalEntry) {
  for (const [field, text] of textFields(e)) {
    for (const term of findTerms(text, FORBIDDEN))
      c.add('vocabulaire', field, `terme interdit « ${term} »`);
    if (hasBareGuilty(text))
      c.add('vocabulaire', field, '« coupable » n’est admis que dans « déclaré(e) coupable »');
    if (HAND_WRITTEN_PRESUMPTION.test(text))
      c.add(
        'vocabulaire',
        field,
        'rappel de présomption écrit à la main (il est généré par le site)'
      );
    if (hasIsoDate(text))
      c.add('vocabulaire', field, 'date ISO dans un texte (écrire en toutes lettres)');
    if (hasWorkNote(text)) c.add('notes-de-travail', field, 'note de travail visible');
  }
}

function checkSources(c: Collector, e: LegalEntry) {
  const all = [
    ...checkSourceList(c, e.sources, 'sources'),
    ...e.steps.flatMap((s, i) => checkSourceList(c, s.sources, `steps[${i}].sources`)),
  ];
  all.forEach((s) => checkSourceContent(c, s, 'sources'));
  e.steps.forEach((s, i) => {
    if (!s.sources.length) c.add('sources', `steps[${i}].sources`, 'au moins une source par étape');
  });
  if (e.nextStep) checkSourceList(c, e.nextStep.sources, 'nextStep.sources');
  const domains = new Set(
    all.filter((s) => INDEPENDENT_LEGAL_KINDS.has(s.kind)).map((s) => domainOf(s.url))
  );
  if (domains.size < MIN_INDEPENDENT_DOMAINS)
    c.add(
      'sources',
      'sources',
      `${domains.size} domaine(s) indépendant(s) (presse ou décision de justice) : ${MIN_INDEPENDENT_DOMAINS} attendus ; une source du parti ne compte pas`
    );
}

function checkDates(c: Collector, e: LegalEntry, today: IsoDay) {
  const dated: [string, string][] = [
    ...(e.facts ? [['facts.start', e.facts.start] as [string, string]] : []),
    ...(e.facts?.end ? [['facts.end', e.facts.end] as [string, string]] : []),
    ...e.steps.map((s, i): [string, string] => [`steps[${i}].date`, s.date]),
    ...(e.pendingRemedy?.filedOn
      ? [['pendingRemedy.filedOn', e.pendingRemedy.filedOn] as [string, string]]
      : []),
    ...(e.nextStep ? [['nextStep.expected', e.nextStep.expected] as [string, string]] : []),
  ];
  let valid = true;
  for (const [field, value] of dated) {
    if (!isValidPartialDate(value)) {
      c.add('dates', field, `date non ISO (AAAA, AAAA-MM ou AAAA-MM-JJ) : ${value}`);
      valid = false;
    }
  }
  if (!FULL_DAY.test(e.lastVerified) || !isValidPartialDate(e.lastVerified)) {
    c.add('dates', 'lastVerified', `date de vérification non ISO : ${e.lastVerified}`);
    valid = false;
  }
  if (!valid) return;

  const start = (d: string) => startOfPeriod(d);
  for (const [field, value] of dated) {
    if (field === 'nextStep.expected') continue;
    if (start(value) > today) c.add('dates', field, `date dans le futur : ${value}`);
  }
  if (e.lastVerified > today) c.add('dates', 'lastVerified', 'vérification datée du futur');

  if (e.facts) {
    const factsEnd = e.facts.end ?? e.facts.start;
    if (start(e.facts.start) > start(factsEnd))
      c.add('dates', 'facts', 'début des faits après leur fin');
    if (start(factsEnd) > start(e.steps[0].date))
      c.add('dates', 'facts', 'faits postérieurs à la première étape');
  }
  e.steps.slice(1).forEach((s, i) => {
    if (start(s.date) < start(e.steps[i].date))
      c.add('dates', `steps[${i + 1}].date`, 'étapes hors ordre chronologique');
  });
  const last = e.steps[e.steps.length - 1];
  if (e.lastVerified < start(last.date))
    c.add('dates', 'lastVerified', 'vérification antérieure à la dernière étape');
  if (e.nextStep && endOfPeriod(e.nextStep.expected) <= endOfPeriod(last.date))
    c.add('dates', 'nextStep.expected', 'échéance non postérieure à la dernière étape');
}

function checkCoherence(c: Collector, e: LegalEntry) {
  const decisions = e.steps.filter((s) => s.outcome !== null);
  const lastDecision = decisions[decisions.length - 1];
  const lastStep = e.steps[e.steps.length - 1];
  e.steps.forEach((s, i) => {
    if (s.penalties?.length && s.outcome !== 'condamnation')
      c.add(
        'coherence',
        `steps[${i}].penalties`,
        'peines sur une étape qui n’est pas une condamnation'
      );
    if ((s.kind === 'jugement' || s.kind.startsWith('arret-')) && s.outcome === null)
      c.add('coherence', `steps[${i}].outcome`, 'issue obligatoire pour un jugement ou un arrêt');
    (s.penalties ?? []).forEach((p, j) => checkPenalty(c, p, `steps[${i}].penalties[${j}]`));
  });
  switch (e.status) {
    case 'condamnation-definitive':
      if (e.pendingRemedy !== null)
        c.add('coherence', 'pendingRemedy', 'condamnation définitive avec un recours en cours');
      if (!decisions.some((s) => s.outcome === 'condamnation'))
        c.add('coherence', 'steps', 'condamnation définitive sans étape de condamnation');
      break;
    case 'condamnation-recours-non-documente':
      if (lastDecision?.outcome !== 'condamnation')
        c.add('coherence', 'steps', 'la dernière décision n’est pas une condamnation');
      if (e.pendingRemedy !== null)
        c.add(
          'coherence',
          'pendingRemedy',
          'recours connu : le statut « sans trace de recours » ne convient pas'
        );
      break;
    case 'mise-en-examen-annulee':
      if (lastStep.outcome !== 'annulation')
        c.add('coherence', 'steps', 'la dernière étape n’annule pas la mise en examen');
      break;
    case 'demande-rejetee':
      if (lastStep.outcome !== 'rejet')
        c.add('coherence', 'steps', 'la dernière étape n’est pas une décision civile de rejet');
      break;
    case 'condamnation-non-definitive':
      if (lastDecision?.outcome !== 'condamnation')
        c.add('coherence', 'steps', 'la dernière décision n’est pas une condamnation');
      if (e.pendingRemedy === null)
        c.add('coherence', 'pendingRemedy', 'condamnation non définitive sans recours en cours');
      break;
    case 'relaxe':
    case 'acquittement':
      if (lastDecision?.outcome !== e.status)
        c.add(
          'coherence',
          'steps',
          `la dernière décision n’est pas ${e.status === 'relaxe' ? 'une relaxe' : 'un acquittement'}`
        );
      break;
    case 'non-lieu':
    case 'classement':
      if (lastStep.kind !== e.status)
        c.add('coherence', 'steps', `la dernière étape n’est pas « ${e.status} »`);
      break;
    case 'extinction-action-publique':
      if (lastStep.kind !== 'extinction')
        c.add('coherence', 'steps', 'la dernière étape n’est pas une extinction');
      break;
  }
}

function checkEntry(
  entry: Rec,
  index: number,
  seen: Set<string>,
  ctx: LegalValidationContext
): LegalIssue[] {
  const c = new Collector(isText(entry.id) ? entry.id : `entries[${index}]`);
  if (!checkEntryShape(c, entry)) return c.issues;
  const e = entry as unknown as LegalEntry;
  if (!SLUG.test(e.id)) c.add('unicite', 'id', `identifiant non conforme (slug attendu) : ${e.id}`);
  if (seen.has(e.id)) c.add('unicite', 'id', `identifiant en double : ${e.id}`);
  seen.add(e.id);
  if ((e.person.kind === 'personne-morale') !== (e.scope === 'parti'))
    c.add(
      'personne',
      'scope',
      'une personne morale relève du périmètre « parti », et seulement elle'
    );
  checkSources(c, e);
  checkDates(c, e, ctx.today);
  checkCoherence(c, e);
  checkVocabulary(c, e);
  return c.issues;
}

/** Validateur unique des dossiers de procédures : tests d'intégrité et script de promotion. */
export function validateLegalDossier(raw: unknown, ctx: LegalValidationContext): LegalIssue[] {
  const c = new Collector(null);
  if (!isRecord(raw)) {
    c.add('forme', 'dossier', 'objet attendu');
    return c.issues;
  }
  if (!isText(raw.partyId)) c.add('forme', 'partyId', 'texte attendu');
  else if (!ctx.partyIds.includes(raw.partyId))
    c.add('unicite', 'partyId', `parti inconnu : ${raw.partyId}`);
  if (!isText(raw.reviewedOn)) c.add('forme', 'reviewedOn', 'date du recensement attendue');
  else if (!FULL_DAY.test(raw.reviewedOn) || !isValidPartialDate(raw.reviewedOn))
    c.add('dates', 'reviewedOn', `date non ISO : ${raw.reviewedOn}`);
  else if (raw.reviewedOn > ctx.today) c.add('dates', 'reviewedOn', 'recensement daté du futur');
  if (!Array.isArray(raw.entries)) {
    c.add('forme', 'entries', 'liste attendue');
    return c.issues;
  }
  const seen = new Set<string>();
  const issues = raw.entries.flatMap((entry, i) =>
    isRecord(entry)
      ? checkEntry(entry, i, seen, ctx)
      : [{ entryId: `entries[${i}]`, field: 'entry', rule: 'forme', detail: 'objet attendu' }]
  );
  return [...c.issues, ...issues];
}
