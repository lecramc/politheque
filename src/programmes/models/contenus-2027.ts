import type { CalculatedDate, GuideSection } from '@/src/programmes/models/programme.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

const FEATURED_ELECTION = '/elections/presidentielle-2027';

/** Adresses des trois pages de contenu de la présidentielle 2027 et du lexique. */
export const CONTENUS_2027_PATHS = {
  lexicon: '/comprendre/lexique',
  election: FEATURED_ELECTION,
  faq: `${FEATURED_ELECTION}/questions`,
  voter: `${FEATURED_ELECTION}/voter`,
  candidates: `${FEATURED_ELECTION}/candidats`,
} as const;

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** « vendredi 12 mars 2027, 18 h » : jour de la semaine déduit de la date ISO (sans fuseau). */
export function calculatedDateText({ date, time }: CalculatedDate): string {
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const base = `${weekday} ${formatLongDate(date)}`;
  if (!time) return base;
  const [hours, minutes] = time.split(':').map(Number);
  return `${base}, ${hours} h${minutes ? ` ${String(minutes).padStart(2, '0')}` : ''}`;
}

export type LessonLink = { id: string; title: string; href: string };

/** Leçons du guide citées par un contenu : les identifiants inconnus sont ignorés. */
export function relatedLessons(guide: GuideSection[], ids: string[]): LessonLink[] {
  return ids.flatMap((id) => {
    const section = guide.find((s) => s.id === id);
    return section ? [{ id, title: section.title, href: `/comprendre/${id}` }] : [];
  });
}

export type CalculatedNote = { label: string; text: string; rule: string };

export const calculatedNotes = (items: CalculatedDate[] = []): CalculatedNote[] =>
  items.map((item) => ({ label: item.label, text: calculatedDateText(item), rule: item.rule }));
