import { FakeAssembleeGateway } from '@/src/assemblee/gateways/fake-assemblee.gateway';
import {
  deputeFactory,
  detailFactory,
  directoryFactory,
  groupeFactory,
  indexFactory,
  manifestFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { loadDeputesUsecase } from '@/src/assemblee/usecases/load-deputes.usecase';
import { loadScrutinDetailUsecase } from '@/src/assemblee/usecases/load-scrutin-detail.usecase';
import { scrutinViewModel } from '@/src/assemblee/view-models/scrutin.view-model';
import { createTestStore } from '@/src/core/store/create-test-store';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { PartyStance } from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';

const dossier = { uid: 'DL1', url: 'https://www.assemblee-nationale.fr/dyn/17/dossiers/DL1' };
const groupes = [
  groupeFactory({
    organeRef: 'PO1',
    abrev: 'LFI-NFP',
    libelle: 'La France insoumise',
    medianePlace: 600,
  }),
  groupeFactory({
    organeRef: 'PO2',
    abrev: 'RN',
    libelle: 'Rassemblement National',
    medianePlace: 100,
  }),
];
const scrutins = [
  scrutinFactory({
    numero: 580,
    date: '2025-01-22',
    titre: "l'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
    demandeur: 'Président du groupe "A"\rPrésidente du groupe "B"',
    adopte: true,
    synthese: {
      votants: 5,
      exprimes: 4,
      requis: 3,
      pour: 3,
      contre: 1,
      abstentions: 1,
      nonVotants: 0,
      nonVotantsVolontaires: 0,
    },
    groupes: [
      [1, 3, 2, 1, 0, 0],
      [0, 2, 1, 0, 1, 0],
    ],
    dossier,
  }),
  scrutinFactory({ numero: 581, date: '2025-02-01', dossier }),
  scrutinFactory({
    numero: 7979,
    type: 'MOC',
    categorie: 'censure',
    adopte: false,
    date: '2026-07-06',
    groupes: [[0, 2, 2, 0, 0, 0]],
  }),
  scrutinFactory({
    numero: 7980,
    type: 'MOC',
    categorie: 'censure',
    adopte: false,
    date: '2026-07-07',
    titre:
      "la motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution par Mme X et 90 députés.",
    dossier: { uid: 'DL2', url: 'https://www.assemblee-nationale.fr/dyn/17/dossiers/DL2' },
    groupes: [[0, 2, 2, 0, 0, 0]],
  }),
  scrutinFactory({
    numero: 7981,
    categorie: 'partie-budget',
    date: '2026-07-08',
    adopte: false,
    dossier: { uid: 'DL2', url: 'https://www.assemblee-nationale.fr/dyn/17/dossiers/DL2' },
  }),
  scrutinFactory({ numero: 7982, categorie: 'partie-budget', date: '2026-07-09', dossier: null }),
];
const detail = detailFactory({
  numero: 580,
  places: [1, 2, 3, 4, 5],
  votes: 'PCAN-',
  deputes: [0, 1, 2, 3, 4],
  groupes: [1, 1, 0, 0, 0],
  delegations: [1],
  misesAuPoint: [],
  sansPlace: [],
});
const directory = directoryFactory([
  deputeFactory({ id: 'PA1', prenom: 'Jean', nom: 'Durand', alpha: 'Durand' }),
  deputeFactory({ id: 'PA2', prenom: 'Anne', nom: 'Martin', alpha: 'Martin' }),
  deputeFactory({ id: 'PA3', prenom: 'Léa', nom: 'Petit', alpha: 'Petit' }),
  deputeFactory({ id: 'PA4', prenom: 'Paul', nom: 'Roux', alpha: 'Roux' }),
  deputeFactory({ id: 'PA5', prenom: 'Zoé', nom: 'Zanetti', alpha: 'Zanetti' }),
]);

const stance = (url: string): PartyStance =>
  ({
    stance: 'pour',
    justification: '',
    sources: [{ title: 's', url, date: '2025-01-22', kind: 'vote' }],
  }) as unknown as PartyStance;

const base = () =>
  assembleeStateBuilder(
    stateBuilder()
      .withCatalog(
        catalogFactory({
          parties: [
            partyFactory({
              id: 'alpha',
              name: 'Alpha',
              stances: { q: stance('https://www.assemblee-nationale.fr/dyn/17/scrutins/580') },
            }),
          ],
        })
      )
      .build()
  )
    .withIndex(indexFactory({ groupes, scrutins }))
    .withManifest(manifestFactory({ extraitLe: '2026-11-10' }));

const vm = (state = base().build(), dispatch = vi.fn()) =>
  scrutinViewModel({ dispatch: dispatch as never })(state);

describe('Feature: page d’un scrutin', () => {
  it('should know no page for an unknown scrutin', () => {
    expect(vm().scrutin(1)).toBeNull();
  });

  it('should open with one header line (date · type of vote), the official title and a small reference', () => {
    const page = vm().scrutin(580)!;
    expect(page).toMatchObject({
      heading: '22 janvier 2025 · Vote solennel',
      reference: 'Scrutin n° 580',
      titre: "L'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
      dateIso: '2025-01-22',
      sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/scrutins/580',
    });
  });

  it('should give the verdict right after the title: one word, the counts, what was needed', () => {
    expect(vm().scrutin(580)!.verdict).toMatchObject({
      kind: 'standard',
      headline: 'Adopté',
      counts: '3 pour · 1 contre · 1 abstention',
      threshold: "Il fallait 3 voix pour l'adopter.",
    });
  });

  it('should word a censure motion by what it decided, without « contre »', () => {
    const page = vm().scrutin(7979)!;
    expect(page.verdict).toMatchObject({
      kind: 'censure',
      headline: 'Motion rejetée : le Gouvernement reste en place.',
      detail:
        "2 députés l'ont votée. Il en fallait 2 (la majorité des membres de l'Assemblée) pour renverser le Gouvernement.",
    });
    expect(page.censure).toBe(true);
    expect(page.details.map((d) => d.id)).not.toContain('votants');
    expect(vm().scrutin(580)!.censure).toBe(false);
  });

  it('should fold the technical facts into the details of the vote, in plain words', () => {
    const { details } = vm().scrutin(580)!;
    expect(details.map((d) => [d.id, d.label])).toEqual([
      ['type', 'Type de vote'],
      ['demandeur', 'Scrutin demandé par'],
      ['votants', 'Ont voté'],
      ['exprimes', 'Votes pour ou contre (sans les abstentions)'],
      ['requis', 'Voix nécessaires pour adopter'],
      ['nonVotants', 'Ne prennent pas part au vote (par exemple la présidence de séance)'],
      ['delegations', 'Votes confiés à un collègue'],
      ['misesAuPoint', 'Corrections après le vote'],
    ]);
    expect(details.find((d) => d.id === 'type')!.values).toEqual([
      "Vote solennel : annoncé à l'avance, sur un texte important",
    ]);
    expect(details.find((d) => d.id === 'demandeur')!.values).toEqual([
      'Président du groupe "A"',
      'Présidente du groupe "B"',
    ]);
    expect(details.find((d) => d.id === 'votants')!.values).toEqual(['5']);
  });

  it('should count the delegations and the corrections in the details, with their definition', () => {
    const page = vm(
      base()
        .withIndex(
          indexFactory({
            groupes,
            scrutins: [scrutinFactory({ numero: 9, delegations: 201, misesAuPoint: 5 })],
          })
        )
        .build()
    ).scrutin(9)!;
    expect(page.details.find((d) => d.id === 'delegations')!.values).toEqual(['201']);
    expect(page.details.find((d) => d.id === 'misesAuPoint')!.values).toEqual(['5']);
    expect(page.glossary).toEqual([
      'Vote confié à un collègue : le député absent a chargé un collègue de voter pour lui.',
      "Correction après le vote : le député indique qu'il voulait voter autrement ; le résultat ne change pas.",
    ]);
  });

  it('should leave the votants out of the details of a censure motion, which would repeat the votes for', () => {
    expect(
      vm()
        .scrutin(7979)!
        .details.map((d) => d.id)
    ).toEqual(['type', 'requis', 'nonVotants', 'delegations', 'misesAuPoint']);
  });

  it('should explain article 49, alinéa 3, with its source, on a third-alinea motion and on a part of a finance bill only', () => {
    const note = vm().scrutin(7980)!.article493;
    expect(note).toEqual({
      text: expect.stringContaining('considéré comme adopté sans vote'),
      sourceLabel: 'Constitution du 4 octobre 1958, article 49 (texte en vigueur)',
      sourceUrl: expect.stringContaining('conseil-constitutionnel.fr'),
    });
    expect(vm().scrutin(7981)!.article493).toEqual(note);
    expect(vm().scrutin(7979)!.article493).toBeNull();
    expect(vm().scrutin(580)!.article493).toBeNull();
  });

  it('should list the third-alinea motions of the same official file on a part of a finance bill, with their result', () => {
    expect(vm().scrutin(7981)!.motionsDeCensure).toEqual([
      { numero: 7980, href: '/assemblee/scrutins/7980', label: 'n° 7980 : Rejetée' },
    ]);
    expect(vm().scrutin(7982)!.motionsDeCensure).toEqual([]);
    expect(vm().scrutin(580)!.motionsDeCensure).toEqual([]);
  });

  it('should show voluntary non-voters only when there are some', () => {
    const ids = (numero: number) =>
      vm()
        .scrutin(numero)!
        .details.map((d) => d.id);
    expect(ids(580)).not.toContain('nonVotantsVolontaires');
    const withVoluntary = base()
      .withIndex(
        indexFactory({
          groupes,
          scrutins: [
            scrutinFactory({
              numero: 1,
              synthese: { ...scrutinFactory().synthese, nonVotantsVolontaires: 2 },
            }),
          ],
        })
      )
      .build();
    const details = vm(withVoluntary).scrutin(1)!.details;
    expect(details.find((d) => d.id === 'nonVotantsVolontaires')).toMatchObject({
      label: 'Ont choisi de ne pas prendre part au vote',
      values: ['2'],
    });
    expect(details.map((d) => d.id).indexOf('nonVotantsVolontaires')).toBe(
      details.map((d) => d.id).indexOf('nonVotants') + 1
    );
  });

  it('should pre-render the group table in seat order, with an alphabetical option', () => {
    const page = vm().scrutin(580)!;
    expect(page.groups('places').rows.map((r) => r.abrev)).toEqual(['LFI-NFP', 'RN']);
    expect(page.groups('alphabetique').rows.map((r) => r.libelle)).toEqual([
      'La France insoumise',
      'Rassemblement National',
    ]);
    expect(page.groups('places').rows[1]).toMatchObject({ membres: 3, pour: 2, contre: 1 });
  });

  it('should list other votes on the same text only through the official dossier', () => {
    expect(
      vm()
        .scrutin(580)!
        .autresVotes.map((v) => v.numero)
    ).toEqual([581]);
    expect(
      vm()
        .scrutin(581)!
        .autresVotes.map((v) => v.numero)
    ).toEqual([580]);
    expect(vm().scrutin(7979)!.autresVotes).toEqual([]);
    expect(vm().scrutin(580)!.dossierUrl).toBe(dossier.url);
  });

  it('should say which party pages cite this vote, read-only from the catalog', () => {
    expect(vm().scrutin(580)!.citations).toEqual([
      { label: 'Alpha, onglet Positions', href: '/partis/alpha/positions' },
    ]);
    expect(vm().scrutin(581)!.citations).toEqual([]);
  });

  it('should keep the page indexable with a factual description', () => {
    expect(vm().scrutin(580)!.meta).toMatchObject({
      robots: 'index, follow',
      description:
        'Scrutin n° 580. Adopté : 3 pour · 1 contre · 1 abstention. Vote de chaque groupe et de chaque député.',
    });
  });
});

describe('Feature: détail par député', () => {
  it('should show a loading state before anything is fetched, as in the prerendered HTML', () => {
    expect(vm().scrutin(580)!.hemicycle).toEqual({ status: 'loading' });
  });

  it('should load the nominative detail and the directory when the page opens', () => {
    const dispatch = vi.fn();
    vm(undefined, dispatch).load(580);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should show an error state with the official link when the detail fails to load', async () => {
    const gateway = new FakeAssembleeGateway();
    gateway.failingScrutins.add(580);
    gateway.directory = directory;
    const store = createTestStore({
      initialState: base().build(),
      dependencies: { assembleeGateway: gateway },
    });
    await store.dispatch(loadScrutinDetailUsecase(580));
    await store.dispatch(loadDeputesUsecase());
    expect(vm(store.getState()).scrutin(580)!.hemicycle).toEqual({
      status: 'error',
      officialUrl: 'https://www.assemblee-nationale.fr/dyn/17/scrutins/580',
    });
  });

  it('should show an error state when only the directory fails', async () => {
    const gateway = new FakeAssembleeGateway();
    gateway.details[580] = detail;
    gateway.error = new Error('hors ligne');
    const store = createTestStore({
      initialState: base().build(),
      dependencies: { assembleeGateway: gateway },
    });
    await store.dispatch(loadDeputesUsecase());
    expect(vm(store.getState()).scrutin(580)!.hemicycle.status).toBe('error');
  });

  const ready = () => {
    const state = base().withDetail(detail).withDeputes(directory).build();
    const hemicycle = vm(state).scrutin(580)!.hemicycle;
    if (hemicycle.status !== 'ready') throw new Error('hémicycle non prêt');
    return hemicycle;
  };

  it('should use one single order of the groups: the table, the filter chips and the diagram follow the same choice', () => {
    const swapped = [
      { ...groupes[0], medianePlace: 100 },
      { ...groupes[1], medianePlace: 600 },
    ];
    const state = base()
      .withIndex(indexFactory({ groupes: swapped, scrutins }))
      .withDetail(detail)
      .withDeputes(directory)
      .build();
    const page = vm(state).scrutin(580)!;
    if (page.hemicycle.status !== 'ready') throw new Error('hémicycle non prêt');
    for (const order of ['places', 'alphabetique'] as const) {
      expect(page.hemicycle.groupes(order).map((g) => g.abrev)).toEqual(
        page.groups(order).rows.map((r) => r.abrev)
      );
    }
    expect(page.hemicycle.groupes('places').map((g) => g.abrev)).toEqual(['RN', 'LFI-NFP']);
    expect(page.hemicycle.groupes('alphabetique').map((g) => g.abrev)).toEqual(['LFI-NFP', 'RN']);
  });

  it('should sum the votes in a single accessible label, not one stop per seat', () => {
    expect(ready().ariaLabel).toBe(
      "Hémicycle de l'Assemblée nationale au scrutin n° 580 : 1 pour, 1 contre, 1 abstention, 1 ne prend pas part au vote, 1 n'a pas voté."
    );
  });

  it('should legend four shapes, and two for a censure motion', () => {
    expect(ready().legend.map((e) => e.label)).toEqual([
      'Pour',
      'Contre',
      'Abstention',
      "N'a pas voté",
    ]);
    const motion = base()
      .withDetail(
        detailFactory({
          ...detail,
          numero: 7979,
          votes: 'PC',
          places: [1, 2],
          deputes: [0, 1],
          groupes: [0, 0],
          delegations: [],
        })
      )
      .withDeputes(directory)
      .build();
    const view = vm(motion).scrutin(7979)!.hemicycle;
    if (view.status !== 'ready') throw new Error('hémicycle non prêt');
    expect(view.legend.map((e) => e.label)).toEqual(['Pour', "N'a pas voté la motion"]);
  });

  it('should name the groups with one template, in the one order of the page', () => {
    expect(ready().groupes('places')[0]).toMatchObject({
      index: 0,
      name: 'La France insoumise (LFI-NFP)',
    });
    expect(
      ready()
        .groupes('alphabetique')
        .map((g) => g.name)
    ).toEqual(
      ready()
        .groupes('alphabetique')
        .map((g) => `${g.libelle} (${g.abrev})`)
    );
  });

  it('should offer the positions of the filter in a fixed order, in words', () => {
    expect(ready().positions).toEqual([
      { code: 'P', label: 'Pour' },
      { code: 'C', label: 'Contre' },
      { code: 'A', label: 'Abstention' },
      { code: 'N', label: 'Ne prend pas part au vote' },
      { code: '-', label: "N'a pas voté" },
    ]);
  });

  it('should write the tooltip of a seat, and the lines of the deputies without a seat', () => {
    const view = ready();
    expect(view.tooltipOf(2)).toBe('Anne Martin, RN : Contre');
    expect(view.tooltipOf(99)).toBeNull();
    const withUnseated = base()
      .withDetail({
        ...detail,
        sansPlace: [{ depute: 4, groupe: 0, vote: 'C', delegation: true }],
      })
      .withDeputes(directory)
      .build();
    const page = vm(withUnseated).scrutin(580)!.hemicycle;
    if (page.status !== 'ready') throw new Error('hémicycle non prêt');
    expect(page.unseatedLines).toEqual([
      'Zoé Zanetti (LFI-NFP) : Contre · vote confié à un collègue',
    ]);
  });

  it('should give a tight box for narrow screens: no room kept around the arc for the labels', () => {
    const view = ready();
    expect(view.compactBox.width).toBeLessThan(view.box.width);
    expect(view.compactBox.ratio).toBeLessThan(view.box.ratio);
    expect(view.compactBox.cx).toBe(view.box.cx);
  });

  it('should give one seat per place with a shape for each position', () => {
    const { seats } = ready();
    expect(seats.map((s) => s.glyph)).toEqual(['disc', 'disc-slash', 'ring', 'dashed', 'dashed']);
  });

  it('should list the deputies alphabetically with the group of the day', () => {
    const { rows } = ready();
    expect(rows.map((r) => [r.nom, r.groupe])).toEqual([
      ['Jean Durand', 'RN'],
      ['Anne Martin', 'RN'],
      ['Léa Petit', 'LFI-NFP'],
      ['Paul Roux', 'LFI-NFP'],
      ['Zoé Zanetti', 'LFI-NFP'],
    ]);
  });

  it('should filter the deputies', () => {
    const page = vm(base().withDetail(detail).withDeputes(directory).build()).scrutin(580)!;
    if (page.hemicycle.status !== 'ready') throw new Error();
    expect(page.hemicycle.search({ recherche: 'martin' }, false).rows.map((r) => r.id)).toEqual([
      'PA2',
    ]);
  });
});
