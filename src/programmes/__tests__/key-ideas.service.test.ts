import { keyIdeasNote } from '@/src/programmes/models/key-ideas.copy';
import {
  keyIdeaMeasureSources,
  keyIdeaOrigin,
  keyIdeaSources,
  isKeyIdeaVerified,
  keyIdeaTheme,
  sortKeyIdeasByTheme,
  nextPartyInJourney,
  displayedKeyIdeas,
  hasKeyIdeas,
  hasKeyIdeasSection,
  KEY_IDEAS_COUNT,
  KEY_IDEAS_MIN,
} from '@/src/programmes/models/key-ideas.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { emptyThemes } from '@/src/programmes/models/party.factory';
import type { KeyIdea, Party, Source } from '@/src/programmes/models/programme.model';

const ELECTION = 'presidentielle-2027';

const source = (url: string, kind: Source['kind'] = 'presse', date = '2026-01'): Source => ({
  title: `Titre ${url}`,
  url,
  date,
  kind,
});

const idea = (overrides: Partial<KeyIdea> = {}): KeyIdea => ({
  id: 'idee',
  title: 'Titre',
  text: 'Texte.',
  measureRefs: ['economie.0'],
  relatedQuestionIds: [],
  ...overrides,
});

/** Parti dont la mesure economie.0 et la position q01 portent les sources données. */
const partyWith = ({
  measureSources = [],
  stanceSources = [],
}: {
  measureSources?: Source[];
  stanceSources?: Source[];
}): Party => {
  const themes = emptyThemes();
  themes.economie.measures = [{ text: 'Mesure', sources: measureSources }];
  return partyFactory({
    stances: { q01: { stance: 2, justification: '', sources: stanceSources } },
    candidacies: {
      [ELECTION]: {
        candidateName: 'X',
        status: 'declare',
        statusLabel: 'Candidat déclaré',
        candidate: '',
        programmeStatus: '',
        programmeState: 'partiel',
        themes,
      },
    },
  });
};

describe('Feature: sources d’une idée clé', () => {
  it('should derive the sources from the referenced measures', () => {
    const a = source('https://a.fr/1', 'programme');
    const party = partyWith({ measureSources: [a] });
    expect(keyIdeaSources(party, ELECTION, idea())).toEqual([a]);
  });

  it('should add the sources of the related questions’ stances, without duplicates by URL', () => {
    const a = source('https://a.fr/1', 'programme');
    const b = source('https://b.fr/1');
    const party = partyWith({ measureSources: [a], stanceSources: [a, b] });
    expect(keyIdeaSources(party, ELECTION, idea({ relatedQuestionIds: ['q01'] }))).toEqual([a, b]);
  });

  it('should ignore the stance sources of a question that is not linked', () => {
    const a = source('https://a.fr/1', 'programme');
    const party = partyWith({ measureSources: [a], stanceSources: [source('https://b.fr/1')] });
    expect(keyIdeaSources(party, ELECTION, idea())).toEqual([a]);
  });
});

describe('Feature: origine d’une idée clé', () => {
  it('should be the strongest source kind, following the charter hierarchy', () => {
    const sources = [
      source('https://a.fr/1', 'presse', '2026-10-06'),
      source('https://b.fr/1', 'declaration', '2026-09'),
      source('https://c.fr/1', 'programme', '2022-03'),
    ];
    expect(keyIdeaOrigin(sources)).toEqual({ kind: 'programme', date: '2022-03' });
    expect(
      keyIdeaOrigin([source('https://a.fr/1', 'presse'), source('https://b.fr/1', 'vote')]).kind
    ).toBe('vote');
  });

  it('should be the most recent among the sources of the same strongest kind', () => {
    const sources = [
      source('https://a.fr/1', 'presse', '2024-06-24'),
      source('https://b.fr/1', 'presse', '2026-10-06'),
      source('https://c.fr/1', 'presse', '2026-08-28'),
    ];
    expect(keyIdeaOrigin(sources)).toEqual({ kind: 'presse', date: '2026-10-06' });
  });

  it('should come from the measures only, never from the stances of related questions', () => {
    const press = source('https://a.fr/1', 'presse', '2026-10');
    const vote = source('https://b.fr/1', 'vote', '2026-01-12');
    const party = partyWith({ measureSources: [press], stanceSources: [vote] });
    const linked = idea({ relatedQuestionIds: ['q01'] });
    expect(keyIdeaMeasureSources(party, ELECTION, linked)).toEqual([press]);
    expect(keyIdeaSources(party, ELECTION, linked)).toEqual([press, vote]);
  });
});

describe('Feature: règle des sources d’une idée clé', () => {
  const programme = source('https://parti.fr/p', 'programme');
  const press = source('https://journal.fr/a', 'presse');

  it('should accept two registrable domains, one of them independent of the party', () => {
    expect(
      isKeyIdeaVerified(partyWith({ measureSources: [programme, press] }), ELECTION, idea())
    ).toBe(true);
  });

  it('should refuse a single source', () => {
    expect(isKeyIdeaVerified(partyWith({ measureSources: [programme] }), ELECTION, idea())).toBe(
      false
    );
  });

  it('should refuse two sources of the same registrable domain', () => {
    const party = partyWith({
      measureSources: [press, source('https://www.journal.fr/b', 'presse')],
    });
    expect(isKeyIdeaVerified(party, ELECTION, idea())).toBe(false);
  });

  it('should refuse two sources that all come from the party itself', () => {
    const party = partyWith({
      measureSources: [programme, source('https://candidat.fr/x', 'declaration')],
    });
    expect(isKeyIdeaVerified(party, ELECTION, idea())).toBe(false);
  });

  it('should count the sources of the related questions to reach the threshold', () => {
    const party = partyWith({ measureSources: [programme], stanceSources: [press] });
    expect(isKeyIdeaVerified(party, ELECTION, idea())).toBe(false);
    expect(isKeyIdeaVerified(party, ELECTION, idea({ relatedQuestionIds: ['q01'] }))).toBe(true);
  });

  it('should not count an aggregator as a distinct domain nor as an independent source', () => {
    const party = partyWith({
      measureSources: [programme, source('https://monvote2027.fr/x', 'presse')],
    });
    expect(isKeyIdeaVerified(party, ELECTION, idea())).toBe(false);
  });
});

describe('Feature: thème et ordre des idées clés', () => {
  const THEMES = ['economie', 'travail', 'immigration', 'securite', 'ecologie'] as const;

  it('should take the theme of the first referenced measure', () => {
    expect(keyIdeaTheme(idea({ measureRefs: ['immigration.3', 'economie.0'] }))).toBe(
      'immigration'
    );
  });

  it('should sort the ideas in the fixed order of the site themes, whatever the editorial order', () => {
    const ideas = [
      idea({ id: 'e', measureRefs: ['ecologie.0'] }),
      idea({ id: 'a', measureRefs: ['economie.0'] }),
      idea({ id: 'i', measureRefs: ['immigration.1'] }),
    ];
    expect(sortKeyIdeasByTheme(ideas, THEMES).map((i) => i.id)).toEqual(['a', 'i', 'e']);
  });
});

describe('Feature: fiche suivante du parcours', () => {
  const parties = [
    partyFactory({ id: 'rn', name: 'Rassemblement national' }),
    partyFactory({ id: 'ecolo', name: 'Les Écologistes' }),
    partyFactory({ id: 'hor', name: 'Horizons' }),
  ];

  it('should follow the alphabetical order of the names, whatever the order of the list', () => {
    // Horizons, Les Écologistes, Rassemblement national.
    expect(nextPartyInJourney(parties, 'hor').id).toBe('ecolo');
    expect(nextPartyInJourney(parties, 'ecolo').id).toBe('rn');
  });

  it('should come back to the first party after the last one', () => {
    expect(nextPartyInJourney(parties, 'rn').id).toBe('hor');
  });
});

describe('Feature: « Ce qu’il propose » de 2 à 4 idées recoupées, décidé parti par parti', () => {
  const programme = source('https://parti.fr/p', 'programme');
  const press = source('https://journal.fr/a', 'presse');
  const THEMES = ['economie', 'travail', 'immigration', 'securite'] as const;

  const fullParty = (id: string, count = KEY_IDEAS_COUNT): Party => {
    const themes = emptyThemes();
    for (const theme of THEMES)
      themes[theme].measures = [{ text: 'M', sources: [programme, press] }];
    const base = partyWith({});
    return {
      ...base,
      id,
      keyIdeas: THEMES.slice(0, count).map((theme) =>
        idea({ id: `${id}-${theme}`, measureRefs: [`${theme}.0`] })
      ),
      candidacies: { [ELECTION]: { ...base.candidacies[ELECTION], themes } },
    };
  };

  it('should bound the section between 2 and 4 ideas', () => {
    expect(KEY_IDEAS_MIN).toBe(2);
    expect(KEY_IDEAS_COUNT).toBe(4);
  });

  it.each([2, 3, 4])('should be published with %i verified ideas', (count) => {
    const party = fullParty('a', count);
    expect(hasKeyIdeasSection(party, ELECTION)).toBe(true);
    expect(displayedKeyIdeas(party, ELECTION)).toHaveLength(count);
  });

  it('should not be published with fewer than 2 verified ideas, without affecting another party', () => {
    const one = fullParty('a', 1);
    expect(hasKeyIdeasSection(one, ELECTION)).toBe(false);
    expect(hasKeyIdeasSection(fullParty('b', 2), ELECTION)).toBe(true);
  });

  it('should display only the verified ideas, and count them toward the minimum', () => {
    const party = fullParty('a', 3);
    party.candidacies[ELECTION].themes.economie.measures = [{ text: 'M', sources: [programme] }];
    expect(displayedKeyIdeas(party, ELECTION).map((i) => i.id)).toEqual([
      'a-travail',
      'a-immigration',
    ]);
    expect(hasKeyIdeasSection(party, ELECTION)).toBe(true);
    party.candidacies[ELECTION].themes.travail.measures = [{ text: 'M', sources: [programme] }];
    expect(hasKeyIdeasSection(party, ELECTION)).toBe(false);
  });

  it('should not be published when two ideas share a theme', () => {
    const doubled = fullParty('b');
    doubled.keyIdeas[1] = idea({ id: 'b-bis', measureRefs: ['economie.0'] });
    expect(hasKeyIdeasSection(doubled, ELECTION)).toBe(false);
  });

  it('should not be published for more than 4 ideas', () => {
    const party = fullParty('a');
    party.keyIdeas.push(idea({ id: 'a-extra', measureRefs: ['travail.0'] }));
    expect(hasKeyIdeasSection(party, ELECTION)).toBe(false);
  });

  it('should leave out a party whose programme is not published: it shows the notice instead', () => {
    const notPublished = fullParty('b');
    notPublished.candidacies[ELECTION].programmeState = 'non-publie';
    notPublished.candidacies[ELECTION].themes = emptyThemes();
    notPublished.keyIdeas = notPublished.keyIdeas.map((i) => ({ ...i, measureRefs: [] }));
    expect(hasKeyIdeasSection(notPublished, ELECTION)).toBe(false);
    expect(displayedKeyIdeas(notPublished, ELECTION)).toEqual([]);
    expect(hasKeyIdeas(notPublished, ELECTION)).toBe(false);
    expect(hasKeyIdeas(fullParty('a'), ELECTION)).toBe(true);
  });
});

describe('Feature: phrase sous « Ce qu’il propose »', () => {
  it('should state the number of verified ideas below 4, with the same text for everyone', () => {
    expect(keyIdeasNote(2)).toBe(
      '2 idées clés recoupées par deux sources ; les autres propositions publiées figurent thème par thème ci-dessous.'
    );
    expect(keyIdeasNote(3)).toMatch(/^3 idées clés recoupées/);
  });

  it('should say nothing with 4 ideas', () => {
    expect(keyIdeasNote(4)).toBeNull();
  });
});
