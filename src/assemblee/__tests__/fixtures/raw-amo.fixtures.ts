import {
  GROUPE_A,
  GROUPE_B,
  GROUPE_C,
} from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import type { RawActeur, RawMandat, RawOrgane } from '@/src/assemblee/models/extraction/raw.model';

type GroupMembership = { groupe: string; debut: string; fin?: string | null };

type ActeurOptions = {
  id: string;
  nom?: string;
  prenom?: string;
  groupes: GroupMembership[];
  /** Mandat de député de la 17e législature. */
  mandat: { debut: string; fin?: string | null; place?: string | null; circo?: string };
};

const gpMandat = (id: string, g: GroupMembership, i: number): RawMandat => ({
  uid: `PM-GP-${id}-${i}`,
  legislature: '17',
  typeOrgane: 'GP',
  dateDebut: g.debut,
  dateFin: g.fin ?? null,
  organes: { organeRef: g.groupe },
});

export const rawActeur = (o: ActeurOptions): RawActeur => ({
  uid: { '#text': o.id },
  etatCivil: {
    ident: {
      civ: 'Mme',
      prenom: o.prenom ?? `Prénom-${o.id}`,
      nom: o.nom ?? `Nom-${o.id}`,
      alpha: o.nom ?? `Nom-${o.id}`,
    },
  },
  mandats: {
    mandat: [
      // mandat de la législature précédente : doit être ignoré
      {
        uid: `PM-OLD-${o.id}`,
        legislature: '16',
        typeOrgane: 'ASSEMBLEE',
        dateDebut: '2022-06-19',
        dateFin: '2024-06-09',
        election: { lieu: { departement: 'Ancien', numCirco: '9' } },
        mandature: { placeHemicycle: '999' },
      },
      {
        uid: `PM-${o.id}`,
        legislature: '17',
        typeOrgane: 'ASSEMBLEE',
        dateDebut: o.mandat.debut,
        dateFin: o.mandat.fin ?? null,
        election: { lieu: { departement: 'Nord', numCirco: o.mandat.circo ?? '3' } },
        mandature: { placeHemicycle: o.mandat.place ?? null },
      },
      ...o.groupes.map((g, i) => gpMandat(o.id, g, i)),
      // autre type d'organe : ignoré
      {
        uid: `PM-COM-${o.id}`,
        legislature: '17',
        typeOrgane: 'COMPER',
        dateDebut: '2024-07-01',
        dateFin: null,
        organes: { organeRef: 'PO-COM' },
      },
    ],
  },
});

export const rawOrgane = (
  uid: string,
  abrev: string,
  extra: Partial<RawOrgane> = {}
): RawOrgane => ({
  uid,
  codeType: 'GP',
  legislature: '17',
  libelle: `Groupe ${abrev}`,
  libelleAbrev: abrev,
  couleurAssociee: '#336699',
  viMoDe: { dateDebut: '2024-07-18', dateFin: null },
  ...extra,
});

const START = '2024-07-01';

/** Députés de la fixture : un remplacement (dep2 → dep7), un changement de groupe (dep6). */
export const rawActeurs = (): RawActeur[] => [
  rawActeur({
    id: 'dep1',
    groupes: [{ groupe: GROUPE_A, debut: START }],
    mandat: { debut: START, place: '010' },
  }),
  rawActeur({
    id: 'dep2',
    groupes: [{ groupe: GROUPE_A, debut: START, fin: '2025-03-20' }],
    mandat: { debut: START, fin: '2025-03-20', place: '011' },
  }),
  rawActeur({
    id: 'dep7',
    groupes: [{ groupe: GROUPE_A, debut: '2025-03-21' }],
    mandat: { debut: '2025-03-21', place: '011' },
  }),
  rawActeur({
    id: 'dep3',
    groupes: [{ groupe: GROUPE_B, debut: START }],
    mandat: { debut: START, place: '150' },
  }),
  rawActeur({
    id: 'dep4',
    groupes: [{ groupe: GROUPE_B, debut: START }],
    mandat: { debut: START, place: '151' },
  }),
  rawActeur({
    id: 'dep5',
    groupes: [{ groupe: GROUPE_C, debut: START }],
    mandat: { debut: START, place: '300' },
  }),
  // change de groupe le 2025-04-01 ; ne vote jamais dans les fixtures : sa place vient du mandat
  rawActeur({
    id: 'dep6',
    groupes: [
      { groupe: GROUPE_C, debut: START, fin: '2025-03-31' },
      { groupe: GROUPE_A, debut: '2025-04-01' },
    ],
    mandat: { debut: START, place: '301' },
  }),
  rawActeur({
    id: 'dep9',
    groupes: [{ groupe: GROUPE_B, debut: '2025-04-01' }],
    mandat: { debut: '2025-04-01', place: '400' },
  }),
];

export const rawOrganes = (): RawOrgane[] => [
  rawOrgane(GROUPE_A, 'GA'),
  rawOrgane(GROUPE_B, 'GB'),
  rawOrgane(GROUPE_C, 'GC', { viMoDe: { dateDebut: '2024-07-18', dateFin: '2025-12-31' } }),
];
