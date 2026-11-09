import fs from 'node:fs';
import path from 'node:path';

import { LEGAL_DOSSIERS } from '@/src/programmes/data/affaires';
import corrections from '@/src/programmes/data/corrections.json';
import { ELECTIONS } from '@/src/programmes/data/elections';
import faq from '@/src/programmes/data/faq-presidentielle-2027.json';
import guide from '@/src/programmes/data/guide.json';
import lexicon from '@/src/programmes/data/lexique.json';
import { PARTIES } from '@/src/programmes/data/parties';
import { QUESTIONS } from '@/src/programmes/data/questions';
import themes from '@/src/programmes/data/themes.json';
import voter from '@/src/programmes/data/voter-2027.json';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { isAggregator } from '@/src/programmes/models/aggregators';
import { validateJournal } from '@/src/programmes/models/corrections/corrections.service';
import { partyLastUpdate } from '@/src/programmes/models/corrections/party-last-update';
import { editorialIssues } from '@/src/programmes/models/editorial-vocabulary';
import { splitIdeals } from '@/src/programmes/models/ideals.service';
import { JOURNEY_GUIDE_IDS } from '@/src/programmes/models/journey.model';
import {
  hasKeyIdeasSection,
  isKeyIdeaVerified,
  KEY_IDEAS_COUNT,
  keyIdeaSources,
  keyIdeaTheme,
} from '@/src/programmes/models/key-ideas.service';
import { followUps } from '@/src/programmes/models/legal/legal-followup';
import { promoteDraft } from '@/src/programmes/models/legal/legal-promotion';
import { validateLegalDossier } from '@/src/programmes/models/legal/legal-validation';
import { firstSentences, formatLongDate } from '@/src/programmes/models/presentation.service';
import type {
  CalculatedDate,
  FaqEntry,
  Source,
  VoterSection,
} from '@/src/programmes/models/programme.model';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';
import { TITLE_MAX_LENGTH } from '@/src/programmes/models/sourced-item.service';
import { verificationLevel } from '@/src/programmes/models/verification.service';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

const PRIMARY_OR_PRESS = new Set([
  'programme',
  'declaration',
  'vote',
  'proposition-de-loi',
  'presse',
]);

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

const KINDS = [
  'programme',
  'declaration',
  'vote',
  'proposition-de-loi',
  'presse',
  'statistique',
  'justice',
];

const expectValidSource = (source: Source, where: string) => {
  expect(source.url, where).toMatch(/^https:\/\//);
  expect(source.title.length, where).toBeGreaterThan(3);
  expect(source.date, where).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
  expect(KINDS, where).toContain(source.kind);
};

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const sentencesOf = (text: string) => {
  const count = text.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«])/).length;
  return { count, first: firstSentences(text, 2) };
};

describe('Feature: règle de rédaction des textes du site (spec § 5.2)', () => {
  const shortTexts = [
    ...guide.map((s) => ({ where: `guide ${s.id}`, text: s.summary })),
    ...themes.map((t) => ({ where: `débat ${t.id}`, text: t.context })),
  ];

  it('should keep every guide summary and debate context to 2 sentences of 25 words at most', () => {
    for (const { where, text } of shortTexts) {
      const { count } = sentencesOf(text);
      expect(count, `${where} : phrases`).toBeLessThanOrEqual(2);
      for (const sentence of text.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«])/)) {
        expect(wordCount(sentence), `${where} : ${sentence}`).toBeLessThanOrEqual(25);
      }
    }
  });

  it('should keep the detail of a debate context behind « En savoir plus », never dropped', () => {
    for (const theme of themes) {
      expect(theme.contextMore.length, theme.id).toBeGreaterThan(0);
    }
  });

  it('should show one paragraph per guide block list and keep the rest in `more`', () => {
    for (const section of guide) {
      for (const block of section.blocks) {
        const paragraphs = block.paragraphs as string[];
        const more = (block as { more?: string[] }).more ?? [];
        expect(paragraphs.length + more.length, `${section.id} / ${block.heading}`).toBeGreaterThan(
          0
        );
        expect(paragraphs.length, `${section.id} / ${block.heading}`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('should not write party texts differently from the data: party keys stay the source of display', () => {
    // La règle de repli porte sur l'affichage (foldAfterSentences), jamais sur les données.
    for (const party of PARTIES) {
      expect(party.description, party.id).toBe(party.description.trim());
    }
  });
});

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

    it('should ground every non-null stance in a non-aggregator primary or press source (charte, règle 7)', () => {
      for (const question of QUESTIONS) {
        const stance = party.stances[question.id];
        if (stance.stance !== null) {
          const grounded = stance.sources.some(
            (s) => !isAggregator(s.url) && PRIMARY_OR_PRESS.has(s.kind)
          );
          expect(grounded, `${party.id}/${question.id}`).toBe(true);
        }
      }
    });

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
      expect(titles.length, party.id).toBeGreaterThanOrEqual(1);
      expect(titles.length, party.id).toBeLessThanOrEqual(4);
      // L'entrée « Ce que dit… » n'existe que si elle atteint le seuil de la règle 7 (sans agrégateur) ;
      // quand elle existe, elle est la première.
      const selfDefinition = titles.filter((t) => /^Ce que di/.test(t));
      if (selfDefinition.length > 0) expect(titles[0], party.id).toMatch(/^Ce que di/);
      expect(titles.filter((t) => t.startsWith('Classement par ')).length, party.id).toBe(1);
    });

    it('should give every party at least one classification ideal', () => {
      expect(splitIdeals(party.history!.ideals).classification.length, party.id).toBeGreaterThan(0);
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

describe('Feature: intégrité du référencement (ajout)', () => {
  const featured = ELECTIONS.find((e) => e.featured)!;

  it('should give every party a history and a candidacy for the featured election (four pages each)', () => {
    for (const party of PARTIES) {
      expect(party.history, `${party.id} history`).toBeDefined();
      expect(party.candidacies[featured.id], `${party.id} candidacy`).toBeDefined();
    }
  });

  it('should only use real ISO verification dates, never in the future, when a date is provided', () => {
    const today = new Date().toISOString().slice(0, 10);
    const dated = [
      ...PARTIES.map((p) => ({ id: p.id, date: p.lastVerified as string | undefined })),
      ...ELECTIONS.map((e) => ({ id: e.id, date: e.lastVerified })),
      ...guide.map((s) => ({ id: s.id, date: (s as { lastVerified?: string }).lastVerified })),
      ...themes.map((t) => ({ id: t.id, date: (t as { lastVerified?: string }).lastVerified })),
    ];
    for (const { id, date } of dated) {
      if (date === undefined) continue;
      expect(date, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date <= today, id).toBe(true);
    }
  });
});

describe('Feature: intégrité du journal des corrections (ajout)', () => {
  const catalog = buildStaticCatalog();
  const today = new Date().toISOString().slice(0, 10);
  const indexablePaths = expandRoutes(catalog)
    // `/partis/[id]` (alias de l'onglet Programme) reste une adresse valide pour les entrées anciennes.
    .filter((u) => u.indexable || u.pattern === '/partis/[id]')
    .map((u) => u.path);

  it('should only contain valid, unique, sorted entries on indexable pages', () => {
    expect(validateJournal(catalog.corrections, { today, indexablePaths })).toEqual([]);
    expect(catalog.corrections).toEqual(corrections);
  });

  it('should show every party correction or update newer than lastVerified as « mise à jour le » (charte, règle 8)', () => {
    const state = stateBuilder().withCatalog(catalog).build();
    const changesAFact = (kind: string) => kind === 'correction' || kind === 'mise-a-jour';
    for (const entry of catalog.corrections.filter((e) => changesAFact(e.kind))) {
      for (const page of entry.pages) {
        const id = /^\/partis\/([^/]+)/.exec(page)?.[1];
        const party = catalog.parties.find((p) => p.id === id);
        if (!party || entry.date <= party.lastVerified) continue;
        const { updatedOn } = partyViewModel(party.id)({ dispatch: vi.fn() })(state);
        const last = partyLastUpdate(party.id, catalog.corrections)!;
        expect(last >= entry.date, `${entry.id} / ${page}`).toBe(true);
        expect(updatedOn, `${entry.id} / ${page}`).toBe(formatLongDate(last));
      }
    }
  });

  it('should hide « mise à jour le » when the journal has nothing newer than lastVerified', () => {
    const state = stateBuilder().withCatalog(catalog).build();
    for (const party of catalog.parties) {
      const last = partyLastUpdate(party.id, catalog.corrections);
      const { updatedOn } = partyViewModel(party.id)({ dispatch: vi.fn() })(state);
      expect(updatedOn !== null, party.id).toBe(last !== null && last > party.lastVerified);
    }
  });

  it('should date every procedures correction no later than the dossier date', () => {
    const lastmod = new Map(expandRoutes(catalog).map((u) => [u.path, u.lastmod] as const));
    for (const entry of catalog.corrections) {
      for (const page of entry.pages.filter((p) => p.endsWith('/procedures-judiciaires'))) {
        expect((lastmod.get(page) ?? '') >= entry.date, `${entry.id} / ${page}`).toBe(true);
      }
    }
  });
});

describe('Feature: intégrité des procédures judiciaires (ajout)', () => {
  const partyIds = PARTIES.map((p) => p.id);
  const today = new Date().toISOString().slice(0, 10);
  const DRAFTS_DIR = path.resolve(__dirname, '../../../docs/affaires');

  it('should publish a dossier for every party or for none', () => {
    expect([0, PARTIES.length]).toContain(LEGAL_DOSSIERS.length);
    expect(new Set(LEGAL_DOSSIERS.map((d) => d.partyId)).size).toBe(LEGAL_DOSSIERS.length);
  });

  it('should attach each dossier to an existing party', () => {
    for (const dossier of LEGAL_DOSSIERS) expect(partyIds).toContain(dossier.partyId);
  });

  it('should validate every published dossier without issue', () => {
    for (const dossier of LEGAL_DOSSIERS) {
      expect(validateLegalDossier(dossier, { today, partyIds }), dossier.partyId).toEqual([]);
    }
  });

  it('should give identical content to an entry present in two dossiers', () => {
    const byId = new Map<string, string>();
    for (const entry of LEGAL_DOSSIERS.flatMap((d) => d.entries)) {
      const json = JSON.stringify(entry);
      expect(byId.get(entry.id) ?? json, entry.id).toBe(json);
      byId.set(entry.id, json);
    }
  });

  it('should match the promoted docs/affaires draft exactly (no hand edit in src/)', () => {
    for (const dossier of LEGAL_DOSSIERS) {
      const file = path.join(DRAFTS_DIR, `${dossier.partyId}.json`);
      expect(fs.existsSync(file), `${dossier.partyId}: brouillon introuvable`).toBe(true);
      const promoted = promoteDraft(JSON.parse(fs.readFileSync(file, 'utf8')), { today, partyIds });
      expect(promoted.ok, dossier.partyId).toBe(true);
      if (promoted.ok) expect(dossier).toEqual(promoted.dossier);
    }
  });

  it('should not leave an announced next step overdue by more than 10 days', () => {
    const overdue = followUps(LEGAL_DOSSIERS, today).filter((f) => f.kind === 'depassee');
    expect(overdue.map((f) => `${f.partyId}/${f.entryId}`)).toEqual([]);
  });
});

describe('Feature: intégrité des idées clés, des libellés courts et de l’identité (ajout)', () => {
  const ELECTION = 'presidentielle-2027';
  const THEME_ORDER = themes.map((t) => t.id);

  it('should give every question a short label of 80 characters at most', () => {
    for (const question of QUESTIONS) {
      expect(question.shortLabel?.trim().length, question.id).toBeGreaterThan(3);
      expect(question.shortLabel.length, question.id).toBeLessThanOrEqual(80);
      expect(editorialIssues(question.shortLabel), question.id).toEqual([]);
    }
  });

  describe('Feature: key ideas section (charter, rule 11)', () => {
    const incompleteParties = PARTIES.filter(
      (party) =>
        party.keyIdeas.length !== KEY_IDEAS_COUNT ||
        !party.keyIdeas.every((idea) => isKeyIdeaVerified(party, ELECTION, idea))
    );

    it('should show the key ideas section only if all parties have exactly 4 verified ideas', () => {
      expect(hasKeyIdeasSection(PARTIES, ELECTION)).toBe(incompleteParties.length === 0);
    });

    it('should hide the key ideas section while some parties are incomplete', () => {
      const names = incompleteParties.map(
        (p) => `${p.id} (${p.keyIdeas.length}/${KEY_IDEAS_COUNT})`
      );
      expect(
        hasKeyIdeasSection(PARTIES, ELECTION),
        `Section masquée, partis incomplets : ${names.join(', ')}`
      ).toBe(incompleteParties.length === 0);
    });
  });

  describe.each(PARTIES.map((p) => [p.id, p] as const))('parti %s', (_, party) => {
    const candidacy = party.candidacies[ELECTION];

    it('should state its founding year, its leader and the state of its programme', () => {
      expect(Number.isInteger(party.foundedYear), party.id).toBe(true);
      expect(party.history!.founded, party.id).toContain(String(party.foundedYear));
      expect(party.leader.name.trim().length, party.id).toBeGreaterThan(3);
      expect(['présidé par', 'dirigé par', 'coordonné par']).toContain(party.leader.role);
      expect(['publie', 'partiel', 'non-publie']).toContain(candidacy.programmeState);
      if (candidacy.programmeState === 'partiel') {
        expect(candidacy.programmeStateDetail!.length, party.id).toBeLessThanOrEqual(30);
      } else {
        expect(candidacy.programmeStateDetail, party.id).toBeUndefined();
      }
    });

    it('should have at most 4 key ideas (charter, rule 11)', () => {
      expect(party.keyIdeas.length, party.id).toBeLessThanOrEqual(KEY_IDEAS_COUNT);
    });

    it('should write each key idea within the limits, without evaluative terms or work notes', () => {
      const ids = party.keyIdeas.map((idea) => idea.id);
      expect(new Set(ids).size, `${party.id}: ids en double`).toBe(ids.length);
      for (const idea of party.keyIdeas) {
        const where = `${party.id}/${idea.id}`;
        expect(idea.title.length, where).toBeLessThanOrEqual(60);
        expect(idea.text.length, where).toBeLessThanOrEqual(200);
        expect(idea.title, where).not.toMatch(WEAK_SOURCE_NAMES);
        expect(idea.text, where).not.toMatch(WEAK_SOURCE_NAMES);
        expect(editorialIssues(idea.title), where).toEqual([]);
        expect(editorialIssues(idea.text), where).toEqual([]);
        expect(idea.relatedQuestionIds.length, where).toBeLessThanOrEqual(2);
      }
    });

    it('should reference existing measures and questions where the party has a position', () => {
      for (const idea of party.keyIdeas) {
        const where = `${party.id}/${idea.id}`;
        expect(idea.measureRefs.length, where).toBeGreaterThan(0);
        for (const ref of idea.measureRefs) {
          const [themeId, index] = ref.split('.');
          const measure =
            candidacy.themes[themeId as keyof typeof candidacy.themes]?.measures[Number(index)];
          expect(measure, `${where}: ${ref}`).toBeDefined();
        }
        for (const questionId of idea.relatedQuestionIds) {
          expect(party.stances[questionId]?.stance, `${where}: ${questionId}`).not.toBeNull();
          expect(party.stances[questionId], `${where}: ${questionId}`).toBeDefined();
        }
      }
    });

    it('should cover 4 different themes, in the fixed order of the site themes', () => {
      const keyThemes = party.keyIdeas.map(keyIdeaTheme);
      expect(new Set(keyThemes).size, party.id).toBe(keyThemes.length);
      const positions = keyThemes.map((theme) => THEME_ORDER.indexOf(theme));
      expect(positions, party.id).toEqual([...positions].sort((a, b) => a - b));
    });

    it('should back every key idea with 2+ sources on distinct domains, one independent of the party', () => {
      for (const idea of party.keyIdeas) {
        const where = `${party.id}/${idea.id}`;
        const sources = keyIdeaSources(party, ELECTION, idea);
        for (const source of sources) expectValidSource(source, where);
        expect(isKeyIdeaVerified(party, ELECTION, idea), where).toBe(true);
      }
    });
  });
});

describe('Feature: intégrité des contenus 2027 (lexique, FAQ, comment voter)', () => {
  const guideIds = guide.map((s) => s.id);
  const today = new Date().toISOString().slice(0, 10);
  const calculated: CalculatedDate[] = [
    ...faq.flatMap((q) => (q as FaqEntry).calculated ?? []),
    ...voter.sections.flatMap((s) => (s as VoterSection).calculated ?? []),
  ];
  const sourced: { where: string; sources: Source[] }[] = [
    ...lexicon.map((t) => ({ where: `lexique ${t.id}`, sources: t.sources as Source[] })),
    ...faq.map((q) => ({ where: `faq ${q.id}`, sources: q.sources as Source[] })),
    { where: 'voter résumé', sources: voter.summarySources as Source[] },
    ...voter.sections.map((s) => ({ where: `voter ${s.id}`, sources: s.sources as Source[] })),
  ];

  it('should give every entry at least one source with an https url, a date and a kind', () => {
    for (const { where, sources } of sourced) {
      expect(sources.length, where).toBeGreaterThan(0);
      for (const source of sources) expectValidSource(source, where);
    }
  });

  it('should never cite an aggregator nor a weak source', () => {
    for (const { where, sources } of sourced) {
      for (const source of sources) {
        expect(isAggregator(source.url), `${where} ${source.url}`).toBe(false);
        expect(source.title + source.url, where).not.toMatch(WEAK_SOURCE_NAMES);
      }
    }
  });

  it('should use real ISO verification dates, never in the future', () => {
    const dates = [
      ...lexicon.map((t) => ({ id: t.id, date: t.lastVerified })),
      ...faq.map((q) => ({ id: q.id, date: q.lastVerified })),
      { id: voter.id, date: voter.lastVerified },
    ];
    for (const { id, date } of dates) {
      expect(date, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date <= today, id).toBe(true);
    }
  });

  it('should have unique ids in the lexicon, the FAQ and the voter sections', () => {
    for (const ids of [
      lexicon.map((t) => t.id),
      faq.map((q) => q.id),
      voter.sections.map((s) => s.id),
    ]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('should only relate to existing guide sections', () => {
    for (const entry of [...lexicon, ...faq]) {
      for (const id of entry.related) expect(guideIds, entry.id).toContain(id);
    }
    expect(guideIds).toContain(voter.guideSectionId);
  });

  it('should link the voter page to the featured election', () => {
    expect(ELECTIONS.map((e) => e.id)).toContain(voter.electionId);
    expect(ELECTIONS.find((e) => e.featured)?.id).toBe(voter.electionId);
  });

  it('should write every calculated date as an ISO date with its rule', () => {
    expect(calculated.length).toBeGreaterThan(0);
    for (const item of calculated) {
      expect(item.date, item.label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.rule.length, item.label).toBeGreaterThan(20);
      if (item.time) expect(item.time, item.label).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('should keep work notes and unsourced wording out of the displayed texts', () => {
    const texts = [
      ...lexicon.flatMap((t) => [t.definition, ...t.more]),
      ...faq.flatMap((q) => [q.answer, ...(q.more ?? [])]),
      voter.summary,
      ...voter.sections.flatMap((s) => [...s.paragraphs, ...(('more' in s && s.more) || [])]),
    ];
    for (const text of texts) {
      expect(text).not.toMatch(WORK_NOTES);
      expect(editorialIssues(text), text).toEqual([]);
    }
  });

  it('should keep every FAQ answer short (60 words at most) and sort-friendly lexicon terms non-empty', () => {
    for (const q of faq) expect(wordCount(q.answer), q.id).toBeLessThanOrEqual(60);
    for (const t of lexicon) expect(t.term.trim().length, t.id).toBeGreaterThan(0);
  });

  it('should load the three data sets into the static catalog', () => {
    const catalog = buildStaticCatalog();
    expect(catalog.lexicon).toHaveLength(lexicon.length);
    expect(catalog.faq).toHaveLength(faq.length);
    expect(catalog.voter.id).toBe(voter.id);
  });
});
