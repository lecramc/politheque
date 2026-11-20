import { createSelector } from 'reselect';

import {
  calculatedNotes,
  CONTENUS_2027_PATHS,
  relatedLessons,
} from '@/src/programmes/models/contenus-2027';
import { lexiconGroups } from '@/src/programmes/models/lexicon.service';
import type { Source } from '@/src/programmes/models/programme.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';
import { lexiconMeta, voterMeta } from '@/src/programmes/models/seo/page-meta';
import { AGENDA_COPY, AGENDA_PATH } from '@/src/programmes/models/voter-calendar.copy';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export const lexiconViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
    const entries = catalog?.lexicon ?? [];
    return {
      status,
      meta: catalog ? lexiconMeta(catalog) : null,
      count: entries.length,
      verifiedOn: maxIsoDate(entries.map((e) => e.lastVerified)),
      groups: lexiconGroups(entries).map((group) => ({
        ...group,
        items: group.entries.map((entry) => ({
          entry,
          lessons: relatedLessons(catalog?.guide ?? [], entry.related, catalog?.voter),
        })),
      })),
      allSources: entries.flatMap((e) => e.sources),
    };
  });

export const voterViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
    const voter = catalog?.voter;
    const sources: Source[] = voter
      ? [...voter.summarySources, ...voter.sections.flatMap((s) => s.sources)]
      : [];
    return {
      status,
      meta: catalog ? voterMeta(catalog) : null,
      voter: voter && voter.sections.length ? voter : null,
      electionHref: CONTENUS_2027_PATHS.election,
      faqHref: CONTENUS_2027_PATHS.faq,
      agenda: { href: AGENDA_PATH, label: AGENDA_COPY.button },
      sections: (voter?.sections ?? []).map((section) => ({
        section,
        calculated: calculatedNotes(section.calculated),
      })),
      allSources: sources,
    };
  });
