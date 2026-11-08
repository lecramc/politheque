import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { glanceQuestionIds } from '@/src/programmes/models/key-ideas.service';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

// Neutralité (charte, règle 6) : même gabarit, même règle, même visibilité pour les dix partis.
const catalog = buildStaticCatalog();
const vmOf = (id: string) =>
  partyViewModel(id)({ dispatch: vi.fn() })(stateBuilder().withCatalog(catalog).build());

describe('Feature: neutralité de la fiche « En bref »', () => {
  it('should show « Ce qu’il propose » for the ten parties or for none', () => {
    const shown = catalog.parties.map((p) => vmOf(p.id).keyIdeas !== null);
    expect(new Set(shown).size).toBe(1);
  });

  it('should give every party the same fields on its key ideas', () => {
    const shapes = catalog.parties.flatMap((p) =>
      p.keyIdeas.map((idea) => Object.keys(idea).sort().join(','))
    );
    expect(new Set(shapes).size).toBe(1);
  });

  it('should not number or rank the ideas', () => {
    for (const party of catalog.parties) {
      for (const idea of party.keyIdeas) {
        expect(idea.title, `${party.id}/${idea.id}`).not.toMatch(/^\s*\d+[.)\s]/);
        expect(idea.id, `${party.id}/${idea.id}`).not.toMatch(/^\d/);
      }
    }
  });

  it('should ask the same 8 questions of every party, each with a position', () => {
    const ids = glanceQuestionIds(catalog.questions, catalog.parties);
    expect(ids).toHaveLength(8);
    for (const party of catalog.parties) {
      expect(
        vmOf(party.id).glance.map((g) => g.questionId),
        party.id
      ).toEqual(ids);
      for (const id of ids) expect(party.stances[id].stance, `${party.id}/${id}`).not.toBeNull();
    }
  });

  it('should write the identity line with the same template for every party', () => {
    for (const party of catalog.parties) {
      expect(vmOf(party.id).identityLine, party.id).toMatch(
        /^Fondé en \d{4} · (présidé|dirigé|coordonné) par \S.+$/
      );
    }
  });

  it('should state the programme state from the same closed list for every party', () => {
    for (const party of catalog.parties) {
      expect(['publie', 'partiel', 'non-publie']).toContain(
        party.candidacies['presidentielle-2027'].programmeState
      );
    }
  });

  it('should chain the ten sheets in one alphabetical loop', () => {
    const ordered = catalog.parties.map((p) => p.id);
    const visited = new Set<string>();
    let current = ordered[0];
    for (let i = 0; i < ordered.length; i++) {
      visited.add(current);
      current = vmOf(current).nextParty!.id;
    }
    expect(visited.size).toBe(ordered.length);
    expect(current).toBe(ordered[0]);
  });
});
