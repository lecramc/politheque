import { ELECTIONS } from '@/src/programmes/data/elections';
import guide from '@/src/programmes/data/guide.json';
import { PARTIES } from '@/src/programmes/data/parties';
import { QUESTIONS } from '@/src/programmes/data/questions';
import themes from '@/src/programmes/data/themes.json';
import { JOURNEY_GUIDE_IDS } from '@/src/programmes/models/journey.model';
import type { Source } from '@/src/programmes/models/programme.model';
import { verificationLevel } from '@/src/programmes/models/verification.service';

// Garde-fou éditorial : la charte (docs/charte-editoriale.md) est vérifiée à chaque test.
const THEME_IDS = [
  'economie',
  'travail',
  'immigration',
  'securite',
  'ecologie',
  'sante',
  'education',
  'europe',
  'institutions',
];
const KINDS = ['programme', 'declaration', 'vote', 'proposition-de-loi', 'presse', 'statistique'];

const expectValidSource = (source: Source, where: string) => {
  expect(source.url, where).toMatch(/^https:\/\//);
  expect(source.title.length, where).toBeGreaterThan(3);
  expect(source.date, where).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
  expect(KINDS, where).toContain(source.kind);
};

describe('Feature: intégrité des données', () => {
  it('should define every theme exactly once', () => {
    expect(themes.map((t) => t.id).sort()).toEqual([...THEME_IDS].sort());
  });

  it('should source every key figure', () => {
    for (const theme of themes) {
      for (const figure of theme.keyFigures) expectValidSource(figure.source as Source, theme.id);
    }
  });

  it('should source every guide block', () => {
    for (const section of guide) {
      for (const block of section.blocks) {
        expect(block.sources.length, `${section.id} / ${block.heading}`).toBeGreaterThan(0);
        for (const source of block.sources) expectValidSource(source as Source, section.id);
      }
    }
  });

  it('should source every election date and summary', () => {
    for (const election of ELECTIONS) {
      expect(election.summarySources.length, election.id).toBeGreaterThan(0);
      for (const step of [...election.rounds, ...election.keyDates]) {
        expect(step.sources.length, `${election.id}: ${step.label}`).toBeGreaterThan(0);
        for (const source of step.sources) expectValidSource(source, election.id);
      }
    }
  });

  it('should link each election only to existing guide sections', () => {
    const ids = guide.map((s) => s.id);
    for (const election of ELECTIONS) {
      for (const id of election.guideSectionIds) expect(ids, election.id).toContain(id);
    }
  });

  it('should have unique question ids', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });

  describe.each(PARTIES.map((p) => [p.id, p] as const))('parti %s', (_, party) => {
    it.each(Object.entries(party.candidacies))(
      'should cover every theme with sourced measures (%s)',
      (_, candidacy) => {
        expect(candidacy.programmeStatus.length).toBeGreaterThan(0);
        expect(candidacy.candidate.startsWith(candidacy.candidateName)).toBe(true);
        expect(['declare', 'investi', 'designe', 'annonce', 'pressenti']).toContain(
          candidacy.status
        );
        for (const id of THEME_IDS) {
          const programme = candidacy.themes[id as keyof typeof candidacy.themes];
          expect(programme, `${party.id}/${id}`).toBeDefined();
          expect(programme.measures.length, `${party.id}/${id}`).toBeGreaterThan(0);
          for (const measure of programme.measures) {
            expect(measure.sources.length, `${party.id}/${id}: ${measure.text}`).toBeGreaterThan(0);
            for (const source of measure.sources) expectValidSource(source, `${party.id}/${id}`);
          }
        }
      }
    );

    it('should give a stance (or explicit null) for every question', () => {
      for (const question of QUESTIONS) {
        const stance = party.stances[question.id];
        expect(stance, `${party.id}/${question.id}`).toBeDefined();
        expect([null, -2, -1, 0, 1, 2]).toContain(stance.stance);
        expect(stance.justification.length, `${party.id}/${question.id}`).toBeGreaterThan(0);
        if (stance.stance !== null) {
          expect(stance.sources.length, `${party.id}/${question.id}`).toBeGreaterThan(0);
          for (const source of stance.sources)
            expectValidSource(source, `${party.id}/${question.id}`);
        }
      }
    });

    it('should cross-check history and ideals with 2+ independent sources', () => {
      expect(party.history, party.id).toBeDefined();
      const history = party.history!;
      const items = [
        history.origins,
        ...history.ideals,
        ...history.timeline,
        ...(history.whyCreated ? [history.whyCreated] : []),
        ...(history.thought ?? []),
      ];
      for (const figure of history.figures ?? []) {
        expect(verificationLevel(figure.sources), `${party.id}: ${figure.name}`).toBe('croisee');
      }
      for (const item of items) {
        const label = 'text' in item ? item.text : item.event;
        expect(verificationLevel(item.sources), `${party.id}: ${label}`).toBe('croisee');
        for (const source of item.sources) expectValidSource(source, party.id);
      }
    });

    it('should state when it was last verified', () => {
      expect(party.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe('Feature: intégrité du parcours (ajout)', () => {
  it('should assign every guide section to exactly one journey step', () => {
    const assigned = Object.values(JOURNEY_GUIDE_IDS).flat();
    expect([...assigned].sort()).toEqual(guide.map((s) => s.id).sort());
  });

  it('should only reference guide sections that exist', () => {
    const ids = guide.map((s) => s.id);
    for (const id of Object.values(JOURNEY_GUIDE_IDS).flat()) expect(ids).toContain(id);
  });
});
