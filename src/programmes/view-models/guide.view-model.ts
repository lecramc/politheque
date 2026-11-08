import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import {
  firstSentence,
  GUIDE_GROUPS,
  readingMinutes,
} from '@/src/programmes/models/presentation.service';
import type { GuideSection } from '@/src/programmes/models/programme.model';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import { guideSectionMeta, nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';
import {
  selectCatalog,
  selectCatalogStatus,
  selectReadIds,
} from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

const minutesOf = (section: GuideSection) =>
  readingMinutes(section.blocks.flatMap((b) => [b.heading, ...b.paragraphs, ...(b.more ?? [])]));

const toRow = (section: GuideSection, readIds: string[]) => ({
  section,
  minutes: minutesOf(section),
  read: readIds.includes(section.id),
});

export const guideViewModel = () =>
  createSelector(
    [selectCatalog, selectCatalogStatus, selectReadIds],
    (catalog, status, readIds) => {
      const sections = catalog?.guide ?? [];
      const byId = new Map(sections.map((s) => [s.id, s]));
      const ordered = GUIDE_GROUPS.flatMap((g) => g.sectionIds)
        .map((id) => byId.get(id))
        .filter((s): s is GuideSection => !!s);
      const next = ordered.find((s) => !readIds.includes(s.id)) ?? null;
      return {
        status,
        total: sections.length,
        readCount: sections.filter((s) => readIds.includes(s.id)).length,
        next: readIds.length > 0 && next ? next : null,
        groups: GUIDE_GROUPS.map((group) => ({
          ...group,
          rows: group.sectionIds
            .map((id) => byId.get(id))
            .filter((s): s is GuideSection => !!s)
            .map((s) => toRow(s, readIds)),
        })),
      };
    }
  );

export const guideSectionViewModel =
  (sectionId: string) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
      const ordered = GUIDE_GROUPS.flatMap((g) => g.sectionIds);
      const sections = catalog?.guide ?? [];
      const section = sections.find((s) => s.id === sectionId) ?? null;
      const nextId = ordered[ordered.indexOf(sectionId) + 1];
      return {
        status,
        section,
        meta: section ? guideSectionMeta(section) : null,
        notFoundMeta: nonIndexableMeta('Section introuvable', `/comprendre/${sectionId}`),
        minutes: section ? minutesOf(section) : 0,
        blocks: (section?.blocks ?? []).map((block) => ({
          block,
          keyPoint: firstSentence(block.paragraphs[0] ?? ''),
        })),
        allSources: (section?.blocks ?? []).flatMap((b) => b.sources),
        next: sections.find((s) => s.id === nextId) ?? null,
        markRead: () => dispatch(markContentReadUsecase(contentKey.guide(sectionId))),
      };
    });
