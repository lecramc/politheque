import { ELECTIONS } from '@/src/programmes/data/elections';
import guide from '@/src/programmes/data/guide.json';
import { PARTIES } from '@/src/programmes/data/parties';
import { QUESTIONS } from '@/src/programmes/data/questions';
import themes from '@/src/programmes/data/themes.json';
import { JOURNEY_GUIDE_IDS } from '@/src/programmes/models/journey.model';
import type { Source } from '@/src/programmes/models/programme.model';
import { TITLE_MAX_LENGTH } from '@/src/programmes/models/sourced-item.service';
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
const WEAK_SOURCE_NAMES = /wikip[ée]dia|monvote|parlons politique|france-vote/i;
const WORK_NOTES = /n'a été identifié|à vérifier|sources consultées|accès bloqué/i;

const STATUS_LABELS: Record<string, string[]> = {
  declare: ['Candidat déclaré', 'Candidate déclarée'],
  annonce: ['Candidature annoncée'],
  investi: ['Candidat investi', 'Candidate investie'],
  designe: ['Candidat désigné', 'Candidate désignée'],
  pressenti: ['Candidat pressenti', 'Candidate pressentie'],
};

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

  it('should keep guide block headings short', () => {
    for (const section of guide) {
      for (const block of section.blocks) {
        expect(block.heading.length, `${section.id} / ${block.heading}`).toBeLessThanOrEqual(
          TITLE_MAX_LENGTH
        );
      }
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
        expect(STATUS_LABELS[candidacy.status], `${party.id}: ${candidacy.statusLabel}`).toContain(
          candidacy.statusLabel
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

    it('should give every idea and current of thought a short title', () => {
      const history = party.history!;
      const lists = [
        ['ideals', history.ideals],
        ['thought', history.thought ?? []],
      ] as const;
      for (const [list, items] of lists) {
        const titles = items.map((item) => item.title);
        expect(new Set(titles).size, `${party.id}/${list}: titres en double`).toBe(titles.length);
        for (const item of items) {
          const where = `${party.id}/${list}: ${item.text.slice(0, 50)}`;
          expect(typeof item.title, where).toBe('string');
          expect(item.title.trim().length, where).toBeGreaterThanOrEqual(3);
          expect(item.title.length, where).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
          expect(item.title, where).not.toMatch(/[.;]\s*$|;/);
          expect(item.title, where).not.toMatch(WEAK_SOURCE_NAMES);
          expect(item.text, where).not.toMatch(WEAK_SOURCE_NAMES);
          expect(item.text, where).not.toMatch(WORK_NOTES);
        }
      }
    });

    it('should present ideas with the same structure for every party', () => {
      const titles = party.history!.ideals.map((item) => item.title);
      expect(titles.length, party.id).toBeGreaterThanOrEqual(2);
      expect(titles.length, party.id).toBeLessThanOrEqual(4);
      expect(titles[0], party.id).toMatch(/^Ce que di/);
      expect(titles.filter((t) => t.startsWith('Classement par ')).length, party.id).toBe(1);
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
