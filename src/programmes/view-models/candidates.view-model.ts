import { createSelector } from 'reselect';

import { SPONSORSHIP_NOTE } from '@/src/programmes/models/candidates.copy';
import {
  buildCandidateList,
  CANDIDATES_PAGE_INTRO,
  SPONSORSHIP_FAQ_ID,
  candidatesDeadlineNote,
  candidatesRule,
} from '@/src/programmes/models/candidates.service';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import type { Source } from '@/src/programmes/models/programme.model';
import { candidatesMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

const uniqueByUrl = (sources: Source[]): Source[] => [
  ...new Map(sources.map((s) => [s.url, s])).values(),
];

export const candidatesViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
    const file = catalog?.candidates;
    const entries =
      catalog && file ? buildCandidateList(catalog.parties, file.candidates, file.electionId) : [];
    const withdrawn = file?.withdrawn ?? [];
    return {
      status,
      meta: catalog ? candidatesMeta(catalog) : null,
      electionHref: CONTENUS_2027_PATHS.election,
      intro: CANDIDATES_PAGE_INTRO,
      deadlineNote: candidatesDeadlineNote(catalog?.faq ?? []),
      sponsorshipNote: SPONSORSHIP_NOTE,
      rule: file ? candidatesRule(file.lastVerified) : '',
      entries,
      withdrawn,
      allSources: uniqueByUrl([
        ...entries.flatMap((e) => e.sources),
        // Source des règles de parrainage : celle de la FAQ qui porte la date limite.
        ...(catalog?.faq.find((q) => q.id === SPONSORSHIP_FAQ_ID)?.sources ?? []),
        ...withdrawn.flatMap((w) => w.sources),
      ]),
    };
  });
