import { createSelector } from 'reselect';

import { t } from '@/src/assemblee/i18n/translate';
import { selectAssembleeIndex } from '@/src/assemblee/store/assemblee.selector';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { stepHref, type JourneyStepId } from '@/src/programmes/models/journey.model';
import { readingMinutes } from '@/src/programmes/models/presentation.service';
import { isRead } from '@/src/programmes/models/reading-progress.model';
import {
  selectCatalog,
  selectCatalogStatus,
  selectJourneyProgress,
  selectProgressStatus,
  selectReadingEntries,
} from '@/src/programmes/store/programmes.selector';

const CHAPTERS: JourneyStepId[] = ['les-bases', 'les-institutions', 'presidentielle-2027'];

const NUMBER_WORDS = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
];
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

/**
 * Comprendre : les leçons en trois chapitres, le suivi de lecture et la suite (fiches, débats,
 * questionnaire). Remplace les pages du parcours. La lecture n'est affichée qu'après l'hydratation :
 * premier rendu identique au HTML statique. Seule la lecture est mesurée, jamais une opinion.
 */
export const comprendreViewModel = () =>
  createSelector(
    [
      selectCatalog,
      selectCatalogStatus,
      selectProgressStatus,
      selectJourneyProgress,
      selectReadingEntries,
      selectAssembleeIndex,
    ],
    (catalog, status, progressStatus, progress, entries, assembleeIndex) => {
      const hydrated = progressStatus === 'ready';
      const stepOf = (id: JourneyStepId) => progress.steps.find((s) => s.step.id === id)!;
      const guide = catalog?.guide ?? [];
      const minutesOf = (id: string) => {
        const section = guide.find((s) => s.id === id);
        return section
          ? readingMinutes(
              section.blocks.flatMap((b) => [b.heading, ...b.paragraphs, ...(b.more ?? [])])
            )
          : null;
      };
      const guideRead = guide.filter((s) => hydrated && isRead(entries, `guide:${s.id}`)).length;
      const countOf = (id: JourneyStepId) => (hydrated ? stepOf(id).readCount : 0);

      return {
        status,
        reading: {
          readCount: guideRead,
          total: guide.length,
          label: `${guideRead} sur ${guide.length}`,
          visible: hydrated,
        },
        progressHref: '/passeport',
        /** Carte d'entrée vers les votes de l'Assemblée : hors parcours, elle ne compte pas dans la lecture. */
        assemblee: {
          title: t('comprendre.cardTitle'),
          text: t('comprendre.cardText'),
          href: '/assemblee',
          meta: assembleeIndex
            ? t('comprendre.cardMeta', { count: assembleeIndex.scrutins.length })
            : null,
        },
        /** Lien sobre vers le lexique : hors parcours, il ne compte pas dans la progression. */
        lexicon: {
          href: CONTENUS_2027_PATHS.lexicon,
          label: `Lexique : ${catalog?.lexicon.length ?? 0} mots de la politique expliqués`,
        },
        chapters: CHAPTERS.map((id, index) => {
          const { step } = stepOf(id);
          return {
            id,
            number: index + 1,
            title: step.title,
            items: step.items.map((item) => ({
              key: item.key,
              title: item.title,
              href: item.href,
              minutes: item.kind === 'guide' ? minutesOf(item.key.slice('guide:'.length)) : null,
              read: hydrated && isRead(entries, item.key),
            })),
          };
        }),
        then: [
          {
            id: 'les-partis' as const,
            title: `Lire les fiches des ${numberWord(stepOf('les-partis').total)} partis`,
            meta: `${countOf('les-partis')} sur ${stepOf('les-partis').total}`,
            href: stepHref(stepOf('les-partis').step),
          },
          {
            id: 'les-grands-debats' as const,
            title: `Parcourir les ${numberWord(stepOf('les-grands-debats').total)} grands débats`,
            meta: `${countOf('les-grands-debats')} sur ${stepOf('les-grands-debats').total}`,
            href: stepHref(stepOf('les-grands-debats').step),
          },
          {
            id: 'me-situer' as const,
            title: `Me situer (${catalog?.questions.length ?? 0} affirmations)`,
            meta: '5 min',
            href: stepHref(stepOf('me-situer').step),
          },
        ],
      };
    }
  );
