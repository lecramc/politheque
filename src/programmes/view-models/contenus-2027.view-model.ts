import { createSelector } from 'reselect';

import {
  calculatedNotes,
  CONTENUS_2027_PATHS,
  relatedLessons,
} from '@/src/programmes/models/contenus-2027';
import { lexiconGroups } from '@/src/programmes/models/lexicon.service';
import type { Source } from '@/src/programmes/models/programme.model';
import { maxIsoDate } from '@/src/programmes/models/seo/dates';
import { faqMeta, lexiconMeta, voterMeta } from '@/src/programmes/models/seo/page-meta';
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
          lessons: relatedLessons(catalog?.guide ?? [], entry.related),
        })),
      })),
      allSources: entries.flatMap((e) => e.sources),
    };
  });

export const faqViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
    const entries = catalog?.faq ?? [];
    return {
      status,
      meta: catalog ? faqMeta(catalog) : null,
      electionHref: CONTENUS_2027_PATHS.election,
      voterHref: CONTENUS_2027_PATHS.voter,
      verifiedOn: maxIsoDate(entries.map((e) => e.lastVerified)),
      items: entries.map((entry) => ({
        entry,
        lessons: relatedLessons(catalog?.guide ?? [], entry.related),
        calculated: calculatedNotes(entry.calculated),
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
      lesson: voter
        ? (relatedLessons(catalog?.guide ?? [], [voter.guideSectionId])[0] ?? null)
        : null,
      sections: (voter?.sections ?? []).map((section) => ({
        section,
        calculated: calculatedNotes(section.calculated),
      })),
      allSources: sources,
    };
  });
