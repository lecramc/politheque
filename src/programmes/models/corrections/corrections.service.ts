import type { ResolvedCorrection } from '@/src/programmes/models/corrections/correction-trailers';
import {
  CORRECTION_KINDS,
  CORRECTIONS_START,
  SUMMARY_MAX,
  SUMMARY_MIN,
  type CorrectionEntry,
} from '@/src/programmes/models/corrections/corrections.model';
import { editorialIssues } from '@/src/programmes/models/editorial-vocabulary';

const SLUG_MAX = 48;

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** `${date}-${slug}` ; suffixe -2, -3… si l'identifiant existe déjà. */
export function correctionId(date: string, summary: string, taken: readonly string[]): string {
  const base = `${date}-${slugify(summary).slice(0, SLUG_MAX).replace(/-+$/, '')}`;
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const sameCorrection = (a: ResolvedCorrection, b: CorrectionEntry) =>
  a.kind === b.kind &&
  a.summary === b.summary &&
  a.pages.length === b.pages.length &&
  a.pages.every((p, i) => p === b.pages[i]);

/**
 * Ajoute les nouvelles corrections en tête de leur jour. Aucune entrée existante n'est modifiée ;
 * une correction identique à une entrée déjà publiée (commit repris avec --amend) est ignorée.
 */
export function mergeCorrections(
  existing: readonly CorrectionEntry[],
  incoming: readonly ResolvedCorrection[],
  date: string
): CorrectionEntry[] {
  const taken = existing.map((e) => e.id);
  const added: CorrectionEntry[] = [];
  for (const c of incoming) {
    if (existing.some((e) => sameCorrection(c, e)) || added.some((e) => sameCorrection(c, e)))
      continue;
    const id = correctionId(date, c.summary, taken);
    taken.push(id);
    added.push({ id, date, kind: c.kind, pages: [...c.pages], summary: c.summary });
  }
  return sortCorrections([...added, ...existing]);
}

/** Date décroissante ; à date égale, l'ordre d'entrée est conservé (tri stable). */
export const sortCorrections = (entries: readonly CorrectionEntry[]): CorrectionEntry[] =>
  [...entries].sort((a, b) => b.date.localeCompare(a.date));

const MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export type CorrectionMonth = { key: string; label: string; entries: CorrectionEntry[] };

export function groupByMonth(entries: readonly CorrectionEntry[]): CorrectionMonth[] {
  const months: CorrectionMonth[] = [];
  for (const entry of entries) {
    const key = entry.date.slice(0, 7);
    let month = months.find((m) => m.key === key);
    if (!month) {
      const [year, m] = key.split('-').map(Number);
      month = { key, label: `${MONTH_LABELS[m - 1]} ${year}`, entries: [] };
      months.push(month);
    }
    month.entries.push(entry);
  }
  return months;
}

/** Chemin → dernier élément de son fil d'Ariane (« Histoire »). L'accueil n'a pas de fil. */
export function pageLabels(
  metas: readonly { path: string; breadcrumb: readonly { name: string; path: string }[] }[]
): Record<string, string> {
  return Object.fromEntries(
    metas.map((m) => [m.path, m.breadcrumb.at(-1)?.name ?? (m.path === '/' ? 'Accueil' : m.path)])
  );
}

/** Contrôle du journal complet (test d'intégrité, `corrections.mjs --check`). */
export function validateJournal(
  entries: readonly CorrectionEntry[],
  ctx: { today: string; indexablePaths: readonly string[] }
): string[] {
  const errors: string[] = [];
  const indexable = new Set(ctx.indexablePaths);
  const ids = new Set<string>();
  entries.forEach((e, i) => {
    const where = e.id;
    if (ids.has(e.id)) errors.push(`${where} : identifiant en double`);
    ids.add(e.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) errors.push(`${where} : date non ISO`);
    else {
      if (e.date > ctx.today) errors.push(`${where} : date dans le futur`);
      if (e.date < CORRECTIONS_START)
        errors.push(`${where} : antérieure au lancement public (${CORRECTIONS_START})`);
    }
    if (i > 0 && entries[i - 1].date < e.date)
      errors.push(`${where} : journal non trié par date décroissante`);
    if (!(CORRECTION_KINDS as readonly string[]).includes(e.kind))
      errors.push(`${where} : type inconnu`);
    if (!e.pages.length) errors.push(`${where} : aucune page`);
    for (const page of e.pages)
      if (!indexable.has(page))
        errors.push(`${where} : page ${page} absente des routes indexables`);
    if (e.summary.length < SUMMARY_MIN || e.summary.length > SUMMARY_MAX)
      errors.push(`${where} : résumé de ${e.summary.length} caractères`);
    for (const issue of editorialIssues(e.summary)) errors.push(`${where} : ${issue}`);
  });
  return errors;
}
