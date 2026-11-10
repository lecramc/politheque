import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import {
  candidatesEntry,
  OTHER_PARTIES_NOTE,
  otherPartyCards,
} from '@/src/programmes/models/other-parties.service';
import type { Catalog, OtherParty } from '@/src/programmes/models/programme.model';

const otherParty = (overrides: Partial<OtherParty> = {}): OtherParty => ({
  id: 'zeta',
  name: 'Zeta',
  candidateId: 'jean-zeta',
  description: 'Un parti.',
  sources: [],
  ...overrides,
});

const catalogWith = (parties: OtherParty[]): Catalog => {
  const base = catalogFactory();
  return {
    ...base,
    otherParties: { ...base.otherParties, parties },
    candidates: {
      ...base.candidates,
      candidates: [
        {
          id: 'jean-zeta',
          name: 'Jean Zeta',
          status: 'declare',
          statusLabel: 'Candidature déclarée',
          date: '2026-05-01',
          affiliation: 'Zeta',
          role: '',
          summary: '',
          sources: [],
        },
      ],
    },
  };
};

describe('Feature: cartes des autres partis présentant un candidat', () => {
  it('should sort the cards alphabetically, whatever the file order', () => {
    const catalog = catalogWith([
      otherParty({ id: 'zeta', name: 'Zeta' }),
      otherParty({ id: 'equinoxe', name: 'Équinoxe', candidateId: 'jean-zeta' }),
    ]);
    expect(otherPartyCards(catalog).map((c) => c.id)).toEqual(['equinoxe', 'zeta']);
  });

  it('should link the candidate to its entry on the candidates page', () => {
    const [card] = otherPartyCards(catalogWith([otherParty()]));
    expect(card).toMatchObject({
      candidateName: 'Jean Zeta',
      candidateHref: '/elections/presidentielle-2027/candidats#jean-zeta',
    });
  });

  it('should give the two label lines to every card, even without any classification', () => {
    const [card] = otherPartyCards(catalogWith([otherParty()]));
    expect(card.labels.map((l) => l.value)).toEqual(['non classé', 'non classé']);
  });

  it('should write the identity line from the fields that exist, without inventing the others', () => {
    const cards = otherPartyCards(
      catalogWith([
        otherParty({
          id: 'a',
          name: 'A',
          foundedYear: 1968,
          leader: { role: 'Porte-parole', name: 'Nathalie Arthaud' },
        }),
        otherParty({ id: 'b', name: 'B' }),
      ])
    );
    expect(cards.map((c) => c.identity)).toEqual([
      'Fondé en 1968 · Porte-parole : Nathalie Arthaud',
      null,
    ]);
  });

  it('should carry the same visible sentence for every card', () => {
    expect(OTHER_PARTIES_NOTE).toBe(
      "Ces partis n'ont pas encore de fiche détaillée sur Polithèque (programme et positions)."
    );
  });

  it('should skip a card whose candidate is missing from the candidates file', () => {
    const catalog = catalogWith([otherParty({ candidateId: 'inconnu' })]);
    expect(otherPartyCards(catalog)).toEqual([]);
  });
});

describe('Feature: accès à la liste des candidats', () => {
  it('should count every candidacy: parties with a sheet and the other candidates', () => {
    const catalog = catalogWith([]);
    catalog.candidates.candidates.push({ ...catalog.candidates.candidates[0], id: 'autre' });
    expect(candidatesEntry(catalog)).toEqual({
      count: 2,
      href: '/elections/presidentielle-2027/candidats',
      label: 'Présidentielle 2027 : les 2 candidatures',
    });
  });

  it('should offer no access when there is no candidacy to list', () => {
    expect(candidatesEntry(catalogFactory())).toBeNull();
  });

  it('should not pluralise a single candidacy', () => {
    expect(candidatesEntry(catalogWith([]))?.label).toBe('Présidentielle 2027 : 1 candidature');
  });
});
