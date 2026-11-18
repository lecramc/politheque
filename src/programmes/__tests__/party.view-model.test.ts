import {
  groupeFactory,
  indexFactory,
  manifestFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import {
  legalDossierFactory,
  legalEntryFactory,
} from '@/src/programmes/models/legal/legal.factory';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
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
    expect(vmOf('alpha').sections.map((s) => s.id)).toEqual(['programme', 'positions', 'histoire']);
    expect(vmOf('alpha').sections.map((s) => s.label)).toEqual([
      'Programme',
      'Positions',
      'Histoire',
    ]);
    expect(vmOf('sans-histoire').sections.map((s) => s.id)).toEqual(['positions']);
  });

  it('should expose sources and meta per section', () => {
    const vm = vmOf('alpha');
    expect(vm.metaBySection?.['histoire'].path).toBe('/partis/alpha/histoire');
    expect(vm.metaBySection?.['programme'].title).toContain('Alpha');
    expect(vm.aliasMeta).toMatchObject({
      path: '/partis/alpha/programme-2027',
      jsonLd: null,
    });
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
    expect(vm.sections.at(-1)).toMatchObject({
      id: 'procedures',
      label: 'Procédures',
      longLabel: 'Procédures judiciaires',
    });
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

describe('Feature: étiquettes sous le nom du parti', () => {
  const withEtiquettes = catalogFactory({
    parties: [
      partyFactory({ id: 'alpha', name: 'Alpha' }),
      partyFactory({ id: 'beta', name: 'Beta' }),
    ],
    etiquettes: {
      ...catalogFactory().etiquettes,
      parties: [
        {
          id: 'alpha',
          name: 'Alpha',
          ministry: { bloc: 'Gauche', nuance: 'SOC', note: '', sources: [] },
          ministryNullReason: null,
          press: { label: 'Gauche', note: '', scholars: [], sources: [] },
          pressNullReason: null,
        },
      ],
    },
  });
  const labelsOf = (id: string) =>
    partyViewModel(id)({ dispatch: vi.fn() })(stateBuilder().withCatalog(withEtiquettes).build())
      .labels;

  it('should show two lines for every party, whether or not it has classifications', () => {
    expect(labelsOf('alpha').lines.map((l) => l.value)).toEqual(['Gauche', 'Gauche']);
    expect(labelsOf('beta').lines.map((l) => l.value)).toEqual(['non classé', 'non classé']);
  });

  it('should open the same detail structure for every party', () => {
    expect(Object.keys(labelsOf('alpha').detail).sort()).toEqual(
      Object.keys(labelsOf('beta').detail).sort()
    );
  });
});

describe('Feature: onglet Programme limité au programme 2027 publié', () => {
  const source = {
    title: 'Site de campagne',
    url: 'https://example.org/programme',
    date: '2026-11-10',
    kind: 'programme' as const,
  };
  const publication = { text: 'Texte de publication.', date: null, sources: [source] };
  const withState = (state: 'non-publie' | 'partiel' | 'publie') => {
    const themes = emptyThemes();
    themes.economie = { summary: 'Résumé.', measures: [{ text: 'Mesure.', sources: [source] }] };
    return catalogFactory({
      parties: [
        partyFactory({
          id: 'gamma',
          name: 'Gamma',
          history,
          candidacies: {
            'presidentielle-2027': {
              ...candidacy,
              programmeState: state,
              programmePublication: publication,
              themes,
            },
          },
        }),
      ],
    });
  };
  const presidentialOf = (state: 'non-publie' | 'partiel' | 'publie') =>
    partyViewModel('gamma')({ dispatch: vi.fn() })(
      stateBuilder().withCatalog(withState(state)).build()
    );

  it('should show the notice and no measure for a programme that is not published', () => {
    const vm = presidentialOf('non-publie');
    expect(vm.programmeNotice).toMatchObject({
      title: 'Programme 2027 pas encore publié',
      text: 'Texte de publication.',
      sources: [source],
      positionsLink: { href: '/partis/gamma/positions' },
    });
    expect(vm.presidential?.sections.every((s) => s.programme?.kind === 'non-publie')).toBe(true);
    expect(vm.keyIdeas).toBeNull();
  });

  it('should put the publication text first for a partial programme and say what a theme lacks', () => {
    const vm = presidentialOf('partiel');
    expect(vm.programmeNotice).toMatchObject({
      title: 'Programme 2027 publié en partie',
      text: 'Le parti a publié une partie de son programme. Ses propositions sont recensées dans 1 thème sur 2.',
      detail: 'Texte de publication.',
    });
    expect(vm.intro).toMatch(/pour l'élection présidentielle de 2027\.$/);
    const kinds = vm.presidential?.sections.map((s) => s.programme?.kind);
    expect(kinds?.[0]).toBe('mesures');
    expect(kinds?.slice(1).every((kind) => kind === 'rien')).toBe(true);
  });
});

describe("Feature: encart « À l'Assemblée » de la fiche", () => {
  const groupes = [
    groupeFactory({
      organeRef: 'PO1',
      abrev: 'DX',
      libelle: 'Droite',
      couleurOfficielle: '#112233',
    }),
  ];
  const assemblee = assembleeStateBuilder(stateBuilder().withCatalog(catalog).build())
    .withIndex(
      indexFactory({
        groupes,
        scrutins: [scrutinFactory({ numero: 3, groupes: [[0, 20, 10, 2, 0, 0]] })],
      })
    )
    .withComposition({ sieges: [[0, 33]], total: 33 })
    .withManifest(manifestFactory({ extraitLe: '2026-11-18' }))
    .build();
  const panelOf = (id: string) => partyViewModel(id)({ dispatch: vi.fn() })(assemblee).assemblee;

  it('should show the group of the party, taken from its colour source, with its official count', () => {
    const grouped = catalogFactory({
      parties: [
        partyFactory({
          id: 'alpha',
          colorSource: { groupe: 'DX', text: '', source: null },
        }),
      ],
    });
    const state = {
      ...assemblee,
      programmes: stateBuilder().withCatalog(grouped).build().programmes,
    };
    const panel = partyViewModel('alpha')({ dispatch: vi.fn() })(state).assemblee;
    expect(panel).toMatchObject({ kind: 'group', name: 'Droite (DX)', count: '33 députés' });
  });

  it('should say there is no group for a party without one', () => {
    expect(panelOf('alpha')).toMatchObject({
      kind: 'none',
      text: "Pas de groupe à l'Assemblée nationale",
    });
  });

  it('should show nothing while the Assemblée data is not loaded', () => {
    expect(vmOf('alpha').assemblee).toBeNull();
  });
});
