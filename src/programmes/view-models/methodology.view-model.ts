import { createSelector } from 'reselect';

import { ARTICLE_49_SOURCE_URL } from '@/src/assemblee/models/article-49-3';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { sourceNote } from '@/src/assemblee/models/source-note';
import { selectAssembleeManifest } from '@/src/assemblee/store/assemblee.selector';
import { readingGuideSections } from '@/src/programmes/models/reading-guides.copy';
import { methodSentences } from '@/src/programmes/models/results.copy';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

export const methodologyViewModel = () =>
  createSelector([selectCatalog, selectAssembleeManifest], (catalog, manifest) => ({
    methodSentences: methodSentences(catalog?.questions.length ?? 0),
    readingGuides: readingGuideSections(
      catalog?.questions.length ?? 0,
      catalog?.parties.length ?? 0
    ),
    /** Section « Votes de l'Assemblée » : critère décrit mécaniquement, source, licence, limites. */
    assemblee: {
      title: COPY.method.title,
      intro: COPY.method.intro,
      criteriaTitle: COPY.method.criteriaTitle,
      criteriaLead: COPY.method.criteriaLead,
      rules: COPY.method.rules,
      criteriaExcluded: COPY.method.criteriaExcluded,
      article493Source: { label: COPY.notes.article493Source, href: ARTICLE_49_SOURCE_URL },
      sourceTitle: COPY.method.sourceTitle,
      source: COPY.method.source,
      extraction: manifest ? sourceNote(manifest).line : null,
      limitsTitle: COPY.method.limitsTitle,
      limits: [
        COPY.method.limitHand,
        COPY.method.limitSchema,
        COPY.method.limitCensure,
        COPY.method.limit493,
        COPY.method.limitNonVoters,
        COPY.method.limitDelegation,
        COPY.method.limitPoint,
        COPY.method.limitGroups,
      ],
      neutrality: COPY.method.neutrality,
      link: { label: COPY.method.link, href: '/assemblee' },
    },
  }));
