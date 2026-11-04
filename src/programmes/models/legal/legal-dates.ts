import type {
  IsoDay,
  IsoPartialDate,
  LegalDossier,
} from '@/src/programmes/models/legal/legal.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';

const PARTIAL = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** AAAA, AAAA-MM ou AAAA-MM-JJ, calendrier réel (pas de 31 avril). */
export function isValidPartialDate(value: string): boolean {
  const match = PARTIAL.exec(value);
  if (!match) return false;
  const [, y, m, d] = match;
  if (m !== undefined && (Number(m) < 1 || Number(m) > 12)) return false;
  if (d !== undefined && (Number(d) < 1 || Number(d) > daysInMonth(Number(y), Number(m)))) {
    return false;
  }
  return true;
}

/** '2027-04' → '2027-04-01' ; '2027' → '2027-01-01'. */
export function startOfPeriod(value: IsoPartialDate): IsoDay {
  const [y, m = '01', d = '01'] = value.split('-');
  return `${y}-${m}-${d}`;
}

/** Fin de la période : '2027-04' → '2027-04-30' ; '2027' → '2027-12-31'. */
export function endOfPeriod(value: IsoPartialDate): IsoDay {
  const [y, m = '12', d] = value.split('-');
  const day = d ?? String(daysInMonth(Number(y), Number(m))).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Ajoute des jours à une date AAAA-MM-JJ (UTC, sans fuseau). */
export function addDays(day: IsoDay, days: number): IsoDay {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entiers de `from` à `to` (négatif si `to` précède `from`). */
export function daysBetween(from: IsoDay, to: IsoDay): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Date du dossier : la plus récente entre le recensement et les vérifications d'entrées. */
export const dossierLastmod = (dossier: LegalDossier): IsoDay | null =>
  maxIsoDate([dossier.reviewedOn, ...dossier.entries.map((e) => e.lastVerified)]);
