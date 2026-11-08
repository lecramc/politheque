import {
  CORRECTION_KINDS,
  SUMMARY_MAX,
  SUMMARY_MIN,
  type CorrectionKind,
} from '@/src/programmes/models/corrections/corrections.model';
import { editorialIssues } from '@/src/programmes/models/editorial-vocabulary';

export const TRAILER_KEY = 'Correction-publique:';
const DATA_DIR = 'src/programmes/data/';
const JOURNAL_FILE = `${DATA_DIR}corrections.json`;

export type TrailerCorrection = {
  kind: CorrectionKind;
  /** 'auto' : déduit des fichiers de données indexés. */
  pages: string[] | 'auto';
  summary: string;
};

export type ParsedTrailers = {
  corrections: TrailerCorrection[];
  /** `Correction-publique: aucune` */
  optOut: boolean;
  errors: string[];
};

/** Lit les lignes `Correction-publique:` (début de ligne seulement ; `#` = commentaire git). */
export function parseCorrectionTrailers(message: string): ParsedTrailers {
  const result: ParsedTrailers = { corrections: [], optOut: false, errors: [] };
  for (const raw of message.split(/\r?\n/)) {
    if (!raw.startsWith(TRAILER_KEY)) continue;
    const body = raw.slice(TRAILER_KEY.length).trim();
    if (body === 'aucune') {
      result.optOut = true;
      continue;
    }
    const parts = body.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      result.errors.push(`« ${body} » : format attendu « type | pages | résumé »`);
      continue;
    }
    const [kind, pages, ...rest] = parts;
    const summary = rest.join(' | ');
    if (!(CORRECTION_KINDS as readonly string[]).includes(kind)) {
      result.errors.push(`type « ${kind} » inconnu (attendu : ${CORRECTION_KINDS.join(', ')})`);
      continue;
    }
    if (summary.length < SUMMARY_MIN || summary.length > SUMMARY_MAX) {
      result.errors.push(
        `résumé de ${summary.length} caractères (attendu : ${SUMMARY_MIN} à ${SUMMARY_MAX}) : « ${summary} »`
      );
      continue;
    }
    const issues = editorialIssues(summary);
    if (issues.length) {
      result.errors.push(`résumé « ${summary} » : ${issues.join(', ')}`);
      continue;
    }
    result.corrections.push({
      kind: kind as CorrectionKind,
      pages:
        pages === 'auto'
          ? 'auto'
          : pages
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean),
      summary,
    });
  }
  return result;
}

/** Fichiers de données dont la modification change ce que le lecteur voit. */
export const isDataFile = (file: string) =>
  file.startsWith(DATA_DIR) && file !== JOURNAL_FILE && /\.(json|ts)$/.test(file);

/** Pages concernées par un fichier de données ([] pour un fichier de code ou d'index). */
export function pagesForDataPath(file: string): string[] {
  if (!file.startsWith(DATA_DIR)) return [];
  const rel = file.slice(DATA_DIR.length);
  let match: RegExpExecArray | null;
  if ((match = /^parties\/([^/]+)\.json$/.exec(rel))) return [`/partis/${match[1]}/programme-2027`];
  if ((match = /^affaires\/([^/]+)\.json$/.exec(rel)))
    return [`/partis/${match[1]}/procedures-judiciaires`];
  if ((match = /^elections\/([^/]+)\.json$/.exec(rel))) return [`/elections/${match[1]}`];
  if (rel === 'guide.json') return ['/comprendre'];
  if (rel === 'themes.json') return ['/partis'];
  if (rel === 'questions.ts') return ['/me-situer'];
  return [];
}

export type ResolvedCorrection = { kind: CorrectionKind; pages: string[]; summary: string };

export type Resolution =
  | { ok: true; optOut: boolean; corrections: ResolvedCorrection[] }
  | { ok: false; errors: string[] };

/**
 * Vérifie le message de commit d'après les fichiers indexés : trailer obligatoire quand des
 * données changent, pages résolues (`auto`) puis présentes dans le registre des routes indexables.
 */
export function resolveCorrections(
  message: string,
  ctx: { stagedFiles: string[]; indexablePaths: readonly string[] }
): Resolution {
  const parsed = parseCorrectionTrailers(message);
  const errors = [...parsed.errors];
  const dataFiles = ctx.stagedFiles.filter(isDataFile);

  if (parsed.optOut && parsed.corrections.length) {
    errors.push('« aucune » ne peut pas être combiné avec une correction');
  }
  if (dataFiles.length && !parsed.optOut && !parsed.corrections.length && !errors.length) {
    errors.push(
      `des fichiers de données sont indexés (${dataFiles.join(', ')}) sans trailer ${TRAILER_KEY}`
    );
  }

  const autoPages = [...new Set(dataFiles.flatMap(pagesForDataPath))];
  const indexable = new Set(ctx.indexablePaths);
  const corrections: ResolvedCorrection[] = [];
  for (const c of parsed.corrections) {
    const pages = c.pages === 'auto' ? autoPages : c.pages;
    if (!pages.length) {
      errors.push(`« ${c.summary} » : aucune page à déduire des fichiers indexés (« auto »)`);
      continue;
    }
    const unknown = pages.filter((p) => !indexable.has(p));
    if (unknown.length) {
      errors.push(
        `« ${c.summary} » : page(s) hors du registre des routes indexables : ${unknown.join(', ')}`
      );
      continue;
    }
    corrections.push({ kind: c.kind, pages, summary: c.summary });
  }

  return errors.length ? { ok: false, errors } : { ok: true, optOut: parsed.optOut, corrections };
}
