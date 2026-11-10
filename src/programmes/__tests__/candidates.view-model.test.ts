import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Catalog, DeclaredCandidate } from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { candidatesViewModel } from '@/src/programmes/view-models/candidates.view-model';

const ELECTION = 'presidentielle-2027';
const source = (n: number) => ({
  title: `Source ${n}`,
  url: `https://example.fr/${n}`,
  date: '2026-11-09',
  kind: 'presse' as const,
});
const riner: DeclaredCandidate = {
  id: 'teddy-riner',
  name: 'Teddy Riner',
  status: 'declare',
  statusLabel: 'Candidature déclarée',
  date: '2026-11-09',
  affiliation: 'Sans étiquette',
  role: 'Judoka',
  summary: 'Annonce sa candidature.',
  sources: [source(1), source(2)],
};
const lfi = partyFactory({
  id: 'lfi',
  name: 'La France insoumise',
  candidacies: {
    [ELECTION]: {
      candidateName: 'Jean-Luc Mélenchon',
      status: 'declare',
      statusLabel: 'Candidat déclaré',
      candidate: 'A déclaré sa candidature le 3 mai 2026.',
      programmeStatus: '',
      programmeState: 'publie',
      themes: emptyThemes(),
    },
  },
});
const withdrawn = {
  id: 'x',
  name: 'Xavier Test',
  date: '2026-07-07',
  summary: 'A renoncé.',
  sources: [source(3)],
};

const vmOf = (overrides: Partial<Catalog> = {}) =>
  candidatesViewModel()(stateBuilder().withCatalog(catalogFactory(overrides)).build());

describe('Feature: view-model de la page des candidats', () => {
  it('should be loading, without meta nor entries, before the catalog is loaded', () => {
    const vm = candidatesViewModel()(stateBuilder().build());
    expect(vm).toMatchObject({ status: 'idle', meta: null, entries: [], withdrawn: [] });
  });

  it('should list parties and other candidates in one alphabetical list', () => {
    const vm = vmOf({
      parties: [lfi],
      candidates: {
        electionId: ELECTION,
        lastVerified: '2026-11-09',
        candidates: [riner],
        withdrawn: [],
      },
    });
    expect(vm.entries.map((e) => e.name)).toEqual(['Jean-Luc Mélenchon', 'Teddy Riner']);
    expect(vm.entries.map((e) => e.programmeHref)).toEqual(['/partis/lfi/programme-2027', null]);
  });

  it('should expose the context sentence, the display rule and the update date', () => {
    const vm = vmOf({
      candidates: {
        electionId: ELECTION,
        lastVerified: '2026-11-09',
        candidates: [],
        withdrawn: [],
      },
    });
    expect(vm.intro).toContain('Conseil constitutionnel');
    expect(vm.intro).not.toMatch(/calculée/);
    expect(vm.rule).toContain('au moins deux sources');
    expect(vm.rule).toContain('9 novembre 2026');
    expect(vm.electionHref).toBe('/elections/presidentielle-2027');
  });

  it('should keep withdrawn candidacies apart from the list', () => {
    const vm = vmOf({
      candidates: {
        electionId: ELECTION,
        lastVerified: '2026-11-09',
        candidates: [riner],
        withdrawn: [withdrawn],
      },
    });
    expect(vm.entries.map((e) => e.name)).toEqual(['Teddy Riner']);
    expect(vm.withdrawn.map((w) => w.name)).toEqual(['Xavier Test']);
  });

  it('should gather every source of the page once, by address', () => {
    const vm = vmOf({
      candidates: {
        electionId: ELECTION,
        lastVerified: '2026-11-09',
        candidates: [riner, { ...riner, id: 'autre', name: 'Autre Nom' }],
        withdrawn: [withdrawn],
      },
    });
    expect(vm.allSources.map((s) => s.url)).toEqual([
      'https://example.fr/1',
      'https://example.fr/2',
      'https://example.fr/3',
    ]);
  });

  it('should expose the page metadata once the catalog is loaded', () => {
    expect(vmOf().meta).toMatchObject({
      path: '/elections/presidentielle-2027/candidats',
      robots: 'index, follow',
    });
  });
});
