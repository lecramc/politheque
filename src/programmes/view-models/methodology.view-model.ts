import { createSelector } from 'reselect';

import { t } from '@/src/assemblee/i18n/translate';
import { ARTICLE_49_SOURCE_URL } from '@/src/assemblee/models/article-49-3';
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
      title: t('method.title'),
      intro: t('method.intro'),
      criteriaTitle: t('method.criteriaTitle'),
      criteriaLead: t('method.criteriaLead'),
      rules: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map((id) => t(`method.${id}`)),
      criteriaExcluded: t('method.criteriaExcluded'),
      article493Source: { label: t('notes.article493Source'), href: ARTICLE_49_SOURCE_URL },
      sourceTitle: t('method.sourceTitle'),
      source: t('method.source'),
      extraction: manifest ? sourceNote(manifest).line : null,
      limitsTitle: t('method.limitsTitle'),
      limits: [
        t('method.limitHand'),
        t('method.limitSchema'),
        t('method.limitCensure'),
        t('method.limit493'),
        t('method.limitNonVoters'),
        t('method.limitDelegation'),
        t('method.limitPoint'),
        t('method.limitGroups'),
      ],
      neutrality: t('method.neutrality'),
      link: { label: t('method.link'), href: '/assemblee' },
    },
  }));
