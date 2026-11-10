import { asList } from '@/src/assemblee/models/extraction/normalize';
import type { RawActeur, RawMandat, RawOrgane } from '@/src/assemblee/models/extraction/raw.model';
import type { Depute, Groupe } from '@/src/assemblee/models/scrutin.model';

export const LEGISLATURE = '17';

export type GroupMembership = { groupeRef: string; debut: string; fin: string | null };

export type ActeurRecord = Depute & {
  groupes: GroupMembership[];
  /** Place attribuée dans l'hémicycle (mandat le plus récent qui en porte une). */
  placeHemicycle: number | null;
};

export type SittingMember = {
  acteurRef: string;
  groupeRef: string;
  placeHemicycle: number | null;
};

export type GroupeIdentity = Omit<Groupe, 'medianePlace'>;

const byStartDate = (a: RawMandat, b: RawMandat) =>
  (a.dateDebut ?? '').localeCompare(b.dateDebut ?? '');

const toPlace = (value: string | null | undefined): number | null => {
  const place = Number.parseInt(value ?? '', 10);
  return Number.isFinite(place) && place > 0 ? place : null;
};

const uniqueMemberships = (mandats: RawMandat[]): GroupMembership[] => {
  const seen = new Set<string>();
  const memberships: GroupMembership[] = [];
  for (const m of mandats) {
    if (!m.organes?.organeRef || !m.dateDebut) continue;
    const membership = {
      groupeRef: m.organes.organeRef,
      debut: m.dateDebut,
      fin: m.dateFin ?? null,
    };
    const key = `${membership.groupeRef}|${membership.debut}|${membership.fin}`;
    if (seen.has(key)) continue;
    seen.add(key);
    memberships.push(membership);
  }
  return memberships;
};

/** Député de la 17e législature, ou null si la personne n'a pas de mandat de député dans celle-ci. */
export const parseActeur = (raw: RawActeur): ActeurRecord | null => {
  const mandats = asList(raw.mandats?.mandat).filter((m) => m.legislature === LEGISLATURE);
  const seats = mandats.filter((m) => m.typeOrgane === 'ASSEMBLEE').sort(byStartDate);
  if (seats.length === 0) return null;
  const latest = seats[seats.length - 1];
  const withPlace = seats.filter((m) => toPlace(m.mandature?.placeHemicycle) !== null);
  const ident = raw.etatCivil.ident;
  return {
    id: raw.uid['#text'],
    civ: ident.civ,
    prenom: ident.prenom,
    nom: ident.nom,
    alpha: ident.alpha,
    departement: latest.election?.lieu?.departement ?? '',
    circonscription: Number.parseInt(latest.election?.lieu?.numCirco ?? '', 10) || 0,
    placeHemicycle: withPlace.length
      ? toPlace(withPlace[withPlace.length - 1].mandature?.placeHemicycle)
      : null,
    groupes: uniqueMemberships(mandats.filter((m) => m.typeOrgane === 'GP').sort(byStartDate)),
  };
};

export const parseGroupe = (raw: RawOrgane): GroupeIdentity | null => {
  if (raw.codeType !== 'GP' || raw.legislature !== LEGISLATURE) return null;
  return {
    organeRef: raw.uid,
    abrev: raw.libelleAbrev,
    libelle: raw.libelle,
    couleurOfficielle: raw.couleurAssociee ?? '',
    debut: raw.viMoDe.dateDebut ?? '',
    fin: raw.viMoDe.dateFin ?? null,
  };
};

/** Députés dont un mandat de groupe couvre le jour (bornes incluses), triés par identifiant. */
export const sittingMembers = (acteurs: ActeurRecord[], date: string): SittingMember[] =>
  acteurs
    .flatMap((acteur) => {
      const membership = acteur.groupes.find(
        (g) => g.debut <= date && (g.fin === null || g.fin >= date)
      );
      return membership
        ? [
            {
              acteurRef: acteur.id,
              groupeRef: membership.groupeRef,
              placeHemicycle: acteur.placeHemicycle,
            },
          ]
        : [];
    })
    .sort((a, b) => (a.acteurRef < b.acteurRef ? -1 : a.acteurRef > b.acteurRef ? 1 : 0));
