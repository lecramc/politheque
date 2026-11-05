import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import {
  legalDossierFactory,
  legalEntryFactory,
} from '@/src/programmes/models/legal/legal.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

const history = {
  founded: '2016',
  origins: { text: '', sources: [] },
  ideals: [],
  timeline: [],
};
const candidacy = {
  candidateName: 'Jeanne Dupont',
  status: 'declare' as const,
  statusLabel: 'Candidate déclarée',
  candidate: '',
  programmeStatus: '',
  programmeState: 'non-publie' as const,
  themes: {} as never,
};

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'alpha',
      name: 'Alpha',
      history,
      candidacies: { 'presidentielle-2027': candidacy },
    }),
    partyFactory({ id: 'sans-histoire', name: 'Sans histoire' }),
  ],
});

const vmOf = (id: string, dispatch = vi.fn()) =>
  partyViewModel(id)({ dispatch })(stateBuilder().withCatalog(catalog).build());

describe('Feature: fiche parti découpée en sections', () => {
  it('should expose available sections in fixed order', () => {
    expect(vmOf('alpha').sections.map((s) => s.id)).toEqual([
      'en-bref',
      'positions',
      'programme-2027',
      'histoire',
    ]);
    expect(vmOf('alpha').sections.map((s) => s.label)).toEqual([
      'En bref',
      'Positions',
      'Programme 2027',
      'Histoire',
    ]);
    expect(vmOf('sans-histoire').sections.map((s) => s.id)).toEqual(['en-bref', 'positions']);
  });

  it('should expose sources and meta per section', () => {
    const vm = vmOf('alpha');
    expect(vm.metaBySection?.['histoire'].path).toBe('/partis/alpha/histoire');
    expect(vm.metaBySection?.['en-bref'].title).toContain('Alpha');
    expect(vm.sourcesBySection['positions']).toEqual([]);
  });

  it('should mark the party read with the party:<id> key whatever the section', () => {
    const dispatch = vi.fn();
    vmOf('alpha', dispatch).markRead();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should expose a non-indexable meta when the party is not found', () => {
    const vm = vmOf('inconnu');
    expect(vm.party).toBeNull();
    expect(vm.notFoundMeta.robots).toBe('noindex, follow');
  });
});

describe('Feature: section procédures de la fiche parti', () => {
  const published = catalogFactory({
    parties: catalog.parties,
    legal: catalog.parties.map((p) =>
      legalDossierFactory({
        partyId: p.id,
        entries: [legalEntryFactory({ status: 'mise-en-examen' })],
      })
    ),
  });
  const publishedVm = (id: string) =>
    partyViewModel(id)({ dispatch: vi.fn() })(stateBuilder().withCatalog(published).build());

  it('should expose the presented dossier and the procedures meta', () => {
    const vm = publishedVm('alpha');
    expect(vm.sections.at(-1)).toMatchObject({ id: 'procedures', label: 'Procédures' });
    expect(vm.procedures?.ongoing).toHaveLength(1);
    expect(vm.procedures?.ongoing[0].presumptionNotice).toContain("Présomption d'innocence");
    expect(vm.metaBySection?.procedures.path).toBe('/partis/alpha/procedures-judiciaires');
    expect(vm.sourcesBySection.procedures.length).toBeGreaterThan(0);
  });

  it('should expose no procedures when no dossier is published', () => {
    const vm = vmOf('alpha');
    expect(vm.procedures).toBeNull();
    expect(vm.sections.map((s) => s.id)).not.toContain('procedures');
  });
});

describe('Feature: positions regroupées par thème', () => {
  it('should group the stances in the same theme order for every party', () => {
    const order = (id: string) => vmOf(id).stancesByTheme.map((group) => group.theme.id);
    expect(order('alpha')).toEqual(order('sans-histoire'));
  });

  it('should keep every question in exactly one group', () => {
    const vm = vmOf('alpha');
    const grouped = vm.stancesByTheme.flatMap((group) => group.items.map((i) => i.question.id));
    expect(grouped.sort()).toEqual(vm.stances.map((s) => s.question.id).sort());
  });
});
