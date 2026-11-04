import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import {
  ctaLabel,
  itemStatusLabel,
  JOURNEY_COPY,
  nodeAccessibilityLabel,
  passportLabel,
  stepInvite,
  stepMeta,
  summaryLabel,
} from '@/src/programmes/models/journey.copy';
import { buildJourney, type JourneyStepId } from '@/src/programmes/models/journey.model';
import { computeJourneyProgress, type StepProgress } from '@/src/programmes/models/journey.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';

const D = '2026-11-04T10:00:00.000Z';

const progressFor = (
  id: JourneyStepId,
  entries: ReadingEntries = {},
  catalog = catalogFactory()
): StepProgress =>
  computeJourneyProgress(buildJourney(catalog), entries).steps.find((s) => s.step.id === id)!;

const manyParties = () =>
  catalogFactory({
    parties: Array.from({ length: 10 }, (_, i) => partyFactory({ id: `p${i}`, name: `P${i}` })),
  });
const readParties = (n: number): ReadingEntries =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`party:p${i}`, D]));

describe('Feature: libellés du parcours', () => {
  it('should describe a step not started with its total ("10 fiches", "3 lectures")', () => {
    expect(stepMeta(progressFor('les-partis', {}, manyParties()))).toBe('10 fiches');
    expect(stepMeta(progressFor('les-bases'))).toBe('3 lectures');
    expect(stepMeta(progressFor('les-grands-debats'))).toBe('2 débats');
  });

  it('should describe the quiz step with the number of statements', () => {
    expect(stepMeta(progressFor('me-situer'), { questionCount: 30 })).toBe(
      '30 affirmations · 5 min'
    );
  });

  it('should describe a step in progress as "4 sur 10 fiches"', () => {
    expect(stepMeta(progressFor('les-partis', readParties(4), manyParties()))).toBe(
      '4 sur 10 fiches'
    );
  });

  it('should describe a finished step as "3 sur 3 lectures"', () => {
    const entries = {
      'guide:gauche-droite': D,
      'guide:classement-des-partis': D,
      'guide:desinformation': D,
    };
    expect(stepMeta(progressFor('les-bases', entries))).toBe('3 sur 3 lectures');
  });

  it('should use singular forms for one item', () => {
    const catalog = catalogFactory({ parties: [partyFactory({ id: 'p0', name: 'P0' })] });
    expect(stepMeta(progressFor('les-partis', {}, catalog))).toBe('1 fiche');
  });

  it('should mention new items when a stamped step got new content', () => {
    const entries = { ...readParties(10), 'stamp:les-partis': D };
    const grown = catalogFactory({
      parties: Array.from({ length: 11 }, (_, i) => partyFactory({ id: `p${i}`, name: `P${i}` })),
    });
    expect(stepMeta(progressFor('les-partis', entries, grown))).toBe(
      '10 sur 11 fiches · 1 nouvelle fiche'
    );
  });

  it('should use the masculine form for new debates', () => {
    const entries = {
      'debate:economie': D,
      'debate:travail': D,
      'stamp:les-grands-debats': D,
    };
    const grown = catalogFactory();
    grown.themes = [...grown.themes, { ...grown.themes[0], id: 'sante' }];
    expect(stepMeta(progressFor('les-grands-debats', entries, grown))).toBe(
      '2 sur 3 débats · 1 nouveau débat'
    );
  });

  it('should append the days left to the presidential step', () => {
    expect(stepMeta(progressFor('presidentielle-2027'), { daysLeft: 165 })).toBe(
      '3 lectures · J-165'
    );
    expect(stepMeta(progressFor('presidentielle-2027'), { daysLeft: null })).toBe('3 lectures');
  });

  it('should build the full accessibility label of a node, with "étape conseillée"', () => {
    expect(
      nodeAccessibilityLabel(progressFor('les-partis', readParties(4), manyParties()), true, 6)
    ).toBe('Étape 3 sur 6 : Les partis, 4 sur 10 fiches, en cours, étape conseillée');
    expect(nodeAccessibilityLabel(progressFor('les-bases'), false, 6)).toBe(
      'Étape 1 sur 6 : Les bases, 3 lectures, à commencer'
    );
  });

  it('should say a stamp is obtained in the accessibility label', () => {
    const entries = { ...readParties(10), 'stamp:les-partis': D };
    expect(
      nodeAccessibilityLabel(progressFor('les-partis', entries, manyParties()), false, 6)
    ).toBe('Étape 3 sur 6 : Les partis, 10 sur 10 fiches, terminée, tampon obtenu');
  });

  it('should say "Commencer" for an untouched step and "Continuer" otherwise', () => {
    expect(ctaLabel(progressFor('les-bases'))).toBe('Commencer');
    expect(ctaLabel(progressFor('les-bases', { 'guide:gauche-droite': D }))).toBe('Continuer');
  });

  it('should invite to read the remaining parties without reference to the answers', () => {
    expect(stepInvite(progressFor('les-partis', readParties(4), manyParties()))).toBe(
      "Encore 6 fiches à découvrir. Lire tous les partis, y compris ceux dont on se sent loin, c'est la meilleure façon de se faire un avis."
    );
    expect(stepInvite(progressFor('les-partis', readParties(9), manyParties()))).toContain(
      'Encore 1 fiche à découvrir.'
    );
    expect(stepInvite(progressFor('les-partis', readParties(10), manyParties()))).toBeNull();
    expect(stepInvite(progressFor('les-bases'))).toBeNull();
  });

  it('should label items by kind and state', () => {
    expect(itemStatusLabel('party', true)).toBe('Fiche lue');
    expect(itemStatusLabel('party', false)).toBe('À découvrir');
    expect(itemStatusLabel('debate', true)).toBe('Débat lu');
    expect(itemStatusLabel('guide', false)).toBe('À lire');
  });

  it('should summarise stamps and passport in plain words', () => {
    expect(summaryLabel(3, 6)).toBe('3 sur 6 étapes');
    expect(passportLabel(1, 6)).toBe('1 tampon sur 6');
    expect(passportLabel(3, 6)).toBe('3 tampons sur 6');
  });

  it('should never use guilt or score vocabulary in any label', () => {
    const forbidden = /raté|retard|score|niveau|points?\b|série|bravo|champion/i;
    const labels: string[] = Object.values(JOURNEY_COPY).flat() as string[];
    const catalog = manyParties();
    for (const stepId of buildJourney(catalog).map((s) => s.id)) {
      for (const entries of [
        {},
        readParties(4),
        readParties(10),
        { ...readParties(10), 'stamp:les-partis': D },
      ]) {
        const p = progressFor(stepId, entries, catalog);
        for (const isNext of [true, false]) {
          labels.push(
            stepMeta(p, { daysLeft: 10, questionCount: 30 }),
            ctaLabel(p),
            nodeAccessibilityLabel(p, isNext, 6),
            stepInvite(p) ?? ''
          );
        }
      }
    }
    for (const kind of ['guide', 'party', 'debate', 'election', 'quiz'] as const) {
      labels.push(itemStatusLabel(kind, true), itemStatusLabel(kind, false));
    }
    labels.push(summaryLabel(0, 6), passportLabel(0, 6));
    for (const label of labels) expect(label).not.toMatch(forbidden);
  });
});
