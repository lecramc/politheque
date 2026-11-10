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

  it('should show the header with the official title, date, category, type of vote and requesters', () => {
    const page = vm().scrutin(580)!;
    expect(page).toMatchObject({
      heading: 'Scrutin n° 580 du 22 janvier 2025',
      titre: "L'ensemble du projet de loi d'urgence pour Mayotte (première lecture).",
      dateIso: '2025-01-22',
      categorie: "Vote sur l'ensemble d'un texte",
      type: 'Scrutin public solennel',
      demandeurs: ['Président du groupe "A"', 'Présidente du groupe "B"'],
      sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/scrutins/580',
    });
  });

  it('should state the result in one factual sentence', () => {
    expect(vm().scrutin(580)!.resultat).toBe(
      'Adopté : 3 pour, 1 contre, 1 abstention. Majorité requise : 3 voix.'
    );
  });

  it('should word a censure motion without « contre » and say what the source records', () => {
    const page = vm().scrutin(7979)!;
    expect(page.resultat).toBe(
      "Motion rejetée : 2 voix pour, 2 requises (majorité des membres de l'Assemblée)."
    );
    expect(page.censure).toBe(true);
    expect(page.synthese.map((s) => s.id)).not.toContain('contre');
    expect(vm().scrutin(580)!.censure).toBe(false);
  });

  it('should give the synthesis counts of the Assemblée', () => {
    const synth = vm().scrutin(580)!.synthese;
    expect(synth.find((s) => s.id === 'pour')).toMatchObject({ label: 'Pour', value: 3 });
    expect(synth.map((s) => s.id)).toEqual([
      'votants',
      'exprimes',
      'requis',
      'pour',
      'contre',
      'abstentions',
      'nonVotants',
    ]);
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
        .synthese.map((s) => s.id);
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
    const synth = vm(withVoluntary).scrutin(1)!.synthese;
    expect(synth.at(-1)).toMatchObject({ id: 'nonVotantsVolontaires', value: 2 });
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
      "Hémicycle de l'Assemblée nationale au scrutin n° 580 : 1 pour, 1 contre, 1 abstention, 1 non-votant, 1 sans vote enregistré."
    );
  });

  it('should give one seat per place with a shape for each position', () => {
    const { seats } = ready();
    expect(seats.map((s) => s.glyph)).toEqual(['disc', 'disc-slash', 'ring', 'dot', 'dashed']);
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
    expect(page.hemicycle.filter({ recherche: 'martin' }).map((r) => r.id)).toEqual(['PA2']);
  });
});
