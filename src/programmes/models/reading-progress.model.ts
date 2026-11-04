import type { JourneyStepId } from '@/src/programmes/models/journey.model';

/** Date ISO 8601 (`new Date().toISOString()`). */
export type IsoDateTime = string;

export type ContentType = 'guide' | 'party' | 'debate' | 'election' | 'quiz' | 'stamp';

export type ContentKey =
  | `guide:${string}`
  | `party:${string}`
  | `debate:${string}`
  | `election:${string}`
  | 'quiz:done'
  | `stamp:${JourneyStepId}`;

/**
 * Date ISO de PREMIÈRE lecture, par clé. Aucune autre donnée : ni réponse du questionnaire,
 * ni temps de lecture. Mesurer la lecture, jamais les opinions.
 */
export type ReadingEntries = Readonly<Record<string, IsoDateTime>>;

export const contentKey = {
  guide: (id: string): ContentKey => `guide:${id}`,
  party: (id: string): ContentKey => `party:${id}`,
  debate: (themeId: string): ContentKey => `debate:${themeId}`,
  election: (id: string): ContentKey => `election:${id}`,
  quizDone: 'quiz:done' as const,
  stamp: (step: JourneyStepId): ContentKey => `stamp:${step}`,
};

const KEY_PATTERN = /^([a-z]+):([a-z0-9-]+)$/;

/** `type:id` avec id ∈ [a-z0-9-]+ ; renvoie null si mal formé. */
export function parseContentKey(raw: string): { type: ContentType; id: string } | null {
  const match = KEY_PATTERN.exec(raw);
  if (!match) return null;
  return { type: match[1] as ContentType, id: match[2] };
}

const isIsoDate = (value: unknown): value is IsoDateTime =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T/.test(value) &&
  !Number.isNaN(new Date(value).getTime());

/**
 * Nettoie une valeur lue du stockage : garde les clés bien formées dont la date est ISO valide.
 * Les clés bien formées d'un type inconnu sont conservées (compatibilité ascendante).
 */
export function sanitizeEntries(raw: unknown): ReadingEntries {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const entries: Record<string, IsoDateTime> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (parseContentKey(key) && isIsoDate(value)) entries[key] = value;
  }
  return entries;
}

/** Union de deux registres ; en cas de doublon, la date la plus ancienne gagne. */
export function mergeEntries(a: ReadingEntries, b: ReadingEntries): ReadingEntries {
  const merged: Record<string, IsoDateTime> = { ...a };
  for (const [key, date] of Object.entries(b)) {
    if (!(key in merged) || date < merged[key]) merged[key] = date;
  }
  return merged;
}

/** Ancien format (`guide.read-sections` : string[]) → registre. L'ancienne date est inconnue. */
export function migrateLegacyGuideIds(legacy: unknown, now: IsoDateTime): ReadingEntries {
  if (!Array.isArray(legacy)) return {};
  const entries: Record<string, IsoDateTime> = {};
  for (const id of legacy) {
    if (typeof id === 'string' && parseContentKey(`guide:${id}`)) entries[`guide:${id}`] = now;
  }
  return entries;
}

export const isRead = (entries: ReadingEntries, key: ContentKey) => key in entries;
