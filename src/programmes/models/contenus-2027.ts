import type {
  CalculatedDate,
  Catalog,
  GuideSection,
  Source,
} from '@/src/programmes/models/programme.model';
import { formatLongDate, maxIsoDate } from '@/src/programmes/models/seo/dates';

const FEATURED_ELECTION = '/elections/presidentielle-2027';

/** Leçon qui porte aussi les questions-réponses (section finale, ancre `#questions`). */
export const FAQ_LESSON_ID = 'election-presidentielle';
export const FAQ_ANCHOR = 'questions';

/** Questions portées par une leçon : toutes pour la leçon sur la présidentielle, aucune ailleurs. */
export const faqOfLesson = <T>(lessonId: string, faq: T[]): T[] =>
  lessonId === FAQ_LESSON_ID ? faq : [];

/** Identifiant de la page « Comment voter » dans les listes `related` (hors leçons du guide). */
export const VOTER_PAGE_ID = 'voter-2027';

/** Adresses des pages de contenu de la présidentielle 2027 et du lexique. */
export const CONTENUS_2027_PATHS = {
  lexicon: '/comprendre/lexique',
  election: FEATURED_ELECTION,
  /** Page de la leçon qui contient les questions-réponses (sans ancre). */
  faqLesson: `/comprendre/${FAQ_LESSON_ID}`,
  /** Lien vers les questions-réponses : la section finale de la leçon. */
  faq: `/comprendre/${FAQ_LESSON_ID}#${FAQ_ANCHOR}`,
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

/**
 * Pages citées par un contenu : leçons du guide, ou la page « Comment voter » (`voter-2027`).
 * Les identifiants inconnus sont ignorés.
 */
export function relatedLessons(
  guide: GuideSection[],
  ids: string[],
  voter?: { title: string }
): LessonLink[] {
  return ids.flatMap((id) => {
    if (id === VOTER_PAGE_ID) {
      return voter ? [{ id, title: voter.title, href: CONTENUS_2027_PATHS.voter }] : [];
    }
    const section = guide.find((s) => s.id === id);
    return section ? [{ id, title: section.title, href: `/comprendre/${id}` }] : [];
  });
}

export type CalculatedNote = { label: string; text: string; rule: string };

export const calculatedNotes = (items: CalculatedDate[] = []): CalculatedNote[] =>
  items.map((item) => ({ label: item.label, text: calculatedDateText(item), rule: item.rule }));

/**
 * Questions-réponses de la présidentielle 2027, section finale de la leçon `election-presidentielle`.
 * Une question ne renvoie pas vers la page où elle est déjà ; la page « Comment voter » est citée
 * par `voter-2027`.
 */
export function faqSection(catalog: Catalog) {
  return {
    items: catalog.faq.map((entry) => ({
      entry,
      lessons: relatedLessons(
        catalog.guide,
        entry.related.filter((id) => id !== FAQ_LESSON_ID),
        catalog.voter
      ),
      calculated: calculatedNotes(entry.calculated),
    })),
    verifiedOn: maxIsoDate(catalog.faq.map((e) => e.lastVerified)),
    sources: catalog.faq.flatMap((e): Source[] => e.sources),
  };
}
