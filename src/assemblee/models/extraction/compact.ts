import {
  sittingMembers,
  type ActeurRecord,
  type GroupeIdentity,
} from '@/src/assemblee/models/extraction/amo';
import { asList } from '@/src/assemblee/models/extraction/normalize';
import { classifyScrutin } from '@/src/assemblee/models/extraction/perimeter';
import type { RawGroupVote, RawScrutin } from '@/src/assemblee/models/extraction/raw.model';
import {
  assignSeats,
  fillSeats,
  type SeatHistory,
  type SeatMember,
  type SeatedMember,
} from '@/src/assemblee/models/extraction/seats';
import type {
  Depute,
  Groupe,
  GroupeDecompte,
  MiseAuPoint,
  ScrutinDetail,
  ScrutinSummary,
  ScrutinSynthese,
} from '@/src/assemblee/models/scrutin.model';

export type ScrutinSummaryDraft = Omit<ScrutinSummary, 'updatedAt'>;

export type DatasetInput = {
  scrutins: RawScrutin[];
  acteurs: ActeurRecord[];
  groupes: GroupeIdentity[];
};

export type Dataset = {
  /** Groupes dans l'ordre des places (de la gauche à la droite de l'image). */
  groupes: Groupe[];
  /** Annuaire trié : les détails y renvoient par indice. */
  deputes: Depute[];
  /** Triés par numéro de scrutin. */
  scrutins: { summary: ScrutinSummaryDraft; detail: ScrutinDetail }[];
  /** Députés pour lesquels aucune place libre n'est connue (jamais inventée) : à signaler. */
  unplaced: { numero: number; acteurRef: string; vote: SeatMember['vote'] }[];
};

const num = (value: string | number | null | undefined): number => Number(value ?? 0);

const toPlace = (value: string | null | undefined): number | null => {
  const place = Number.parseInt(value ?? '', 10);
  return Number.isFinite(place) && place > 0 ? place : null;
};

const groupsOf = (raw: RawScrutin): RawGroupVote[] =>
  asList(raw.ventilationVotes.organe.groupes.groupe);

const LISTS = [
  ['pours', 'P'],
  ['contres', 'C'],
  ['abstentions', 'A'],
  ['nonVotants', 'N'],
] as const;

/** Tous les votes nominatifs d'un scrutin, avec le groupe tel que la source le ventile ce jour-là. */
export const votersOf = (raw: RawScrutin): SeatMember[] =>
  groupsOf(raw).flatMap((g) =>
    LISTS.flatMap(([key, vote]) =>
      asList(g.vote.decompteNominatif[key]?.votant).map(
        (v): SeatMember => ({
          acteurRef: v.acteurRef,
          groupeRef: g.organeRef,
          vote,
          delegation: v.parDelegation === 'true',
          place: toPlace(v.numPlace),
        })
      )
    )
  );

const SOUHAITS = [
  ['pours', 'P'],
  ['contres', 'C'],
  ['abstentions', 'A'],
  ['nonVotants', 'N'],
  ['nonVotantsVolontaires', 'N'],
] as const;

type RawSouhait = { acteurRef: string; souhait: MiseAuPoint['souhait'] };

/** Les mises au point : chaque liste est null, un objet ou un tableau de trous et de `{ votant }`. */
export const misesAuPointOf = (raw: RawScrutin): RawSouhait[] => {
  const miseAuPoint = raw.miseAuPoint;
  if (!miseAuPoint) return [];
  return SOUHAITS.flatMap(([key, souhait]) =>
    asList(miseAuPoint[key] as { votant?: { acteurRef: string } | { acteurRef: string }[] } | null)
      .flatMap((slot) => asList(slot.votant))
      .map((v) => ({ acteurRef: v.acteurRef, souhait }))
  );
};

const synthese = (raw: RawScrutin): ScrutinSynthese => ({
  votants: num(raw.syntheseVote.nombreVotants),
  exprimes: num(raw.syntheseVote.suffragesExprimes),
  requis: num(raw.syntheseVote.nbrSuffragesRequis),
  pour: num(raw.syntheseVote.decompte.pour),
  contre: num(raw.syntheseVote.decompte.contre),
  abstentions: num(raw.syntheseVote.decompte.abstentions),
  nonVotants: num(raw.syntheseVote.decompte.nonVotants),
  nonVotantsVolontaires: num(raw.syntheseVote.decompte.nonVotantsVolontaires),
});

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

/** Comparaison indépendante de la locale : le résultat ne doit pas varier d'une machine à l'autre. */
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const foldKey = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const compareDeputes = (a: Depute, b: Depute) =>
  compareText(foldKey(a.alpha), foldKey(b.alpha)) ||
  compareText(foldKey(a.prenom), foldKey(b.prenom)) ||
  compareText(a.id, b.id);

type Seating = {
  raw: RawScrutin;
  numero: number;
  regles: ScrutinSummary['regles'];
  categorie: ScrutinSummary['categorie'];
  voters: SeatMember[];
  seated: SeatedMember[];
  unplaced: SeatMember[];
};

export const compactDataset = (input: DatasetInput): Dataset => {
  const included = input.scrutins
    .map((raw) => ({ raw, ...classifyScrutin(raw) }))
    .filter((s) => s.inclus)
    .sort((a, b) => num(a.raw.numero) - num(b.raw.numero));
  const acteurs = new Map(input.acteurs.map((a) => [a.id, a]));
  const known = (acteurRef: string): ActeurRecord => {
    const acteur = acteurs.get(acteurRef);
    if (!acteur) throw new Error(`Acteur ${acteurRef} absent de l'annuaire des acteurs`);
    return acteur;
  };

  // 1. Places observées pour chaque député, sur toute la période.
  const withVoters = included.map((s) => ({
    ...s,
    numero: num(s.raw.numero),
    voters: votersOf(s.raw),
  }));
  const history: SeatHistory = {};
  for (const s of withVoters) {
    for (const v of s.voters) {
      if (v.place !== null) {
        known(v.acteurRef);
        (history[v.acteurRef] ??= []).push({ date: s.raw.dateScrutin, place: v.place });
      }
    }
  }

  const hemicyclePlaces = Object.fromEntries(
    input.acteurs.map((a) => [a.id, a.placeHemicycle] as const)
  );

  // 2. Occupation des places jour par jour.
  const seatings: Seating[] = withVoters.map((s) => {
    const voted = new Set(s.voters.map((v) => v.acteurRef));
    for (const ref of voted) known(ref);
    const absents = sittingMembers(input.acteurs, s.raw.dateScrutin).filter(
      (m) => !voted.has(m.acteurRef)
    );
    const { seated, unplaced } = assignSeats({
      date: s.raw.dateScrutin,
      voters: s.voters,
      absents,
      history,
      hemicyclePlaces,
    });
    return { ...s, seated, unplaced };
  });
  const universe = [...new Set(seatings.flatMap((s) => s.seated.map((m) => m.place)))].sort(
    (a, b) => a - b
  );

  // 3. Groupes : ceux ventilés ou occupés, ordonnés par médiane des places (gauche → droite).
  const placesByGroup = new Map<string, number[]>();
  for (const s of seatings) {
    for (const v of s.voters) {
      if (v.place !== null)
        placesByGroup.set(v.groupeRef, [...(placesByGroup.get(v.groupeRef) ?? []), v.place]);
    }
  }
  const identities = new Map(input.groupes.map((g) => [g.organeRef, g]));
  const groupRefs = new Set(
    seatings.flatMap((s) => [
      ...groupsOf(s.raw).map((g) => g.organeRef),
      ...s.seated.map((m) => m.groupeRef),
      ...s.unplaced.map((m) => m.groupeRef),
    ])
  );
  const groupes: Groupe[] = [...groupRefs]
    .map((ref) => {
      const identity = identities.get(ref);
      if (!identity) throw new Error(`Groupe ${ref} absent de l'annuaire des organes`);
      return { ...identity, medianePlace: median(placesByGroup.get(ref) ?? []) };
    })
    .sort(
      (a, b) =>
        b.medianePlace - a.medianePlace ||
        compareText(a.abrev, b.abrev) ||
        compareText(a.organeRef, b.organeRef)
    );
  const groupIdx = new Map(groupes.map((g, i) => [g.organeRef, i]));

  // 4. Annuaire des députés référencés.
  const misesAuPoint = new Map(seatings.map((s) => [s.numero, misesAuPointOf(s.raw)]));
  const referenced = new Set<string>();
  for (const s of seatings) {
    s.seated.forEach((m) => referenced.add(m.acteurRef));
    s.unplaced.forEach((m) => referenced.add(m.acteurRef));
    misesAuPoint.get(s.numero)?.forEach((m) => referenced.add(m.acteurRef));
  }
  const deputes: Depute[] = [...referenced]
    .map((ref) => {
      const { id, civ, prenom, nom, alpha, departement, circonscription } = known(ref);
      return { id, civ, prenom, nom, alpha, departement, circonscription };
    })
    .sort(compareDeputes);
  const deputeIdx = new Map(deputes.map((d, i) => [d.id, i]));

  // 5. Résumés et détails.
  const scrutins = seatings.map((s) => {
    const groupDecomptes = groupsOf(s.raw)
      .map((g): GroupeDecompte => {
        const voix = g.vote.decompteVoix;
        return [
          groupIdx.get(g.organeRef) as number,
          num(g.nombreMembresGroupe),
          num(voix.pour),
          num(voix.contre),
          num(voix.abstentions),
          num(voix.nonVotants),
        ];
      })
      .sort((a, b) => a[0] - b[0]);
    const dossier = s.raw.objet?.dossierLegislatif;
    const { places, seats } = fillSeats(universe, s.seated);
    const souhaits: MiseAuPoint[] = (misesAuPoint.get(s.numero) ?? [])
      .map((m) => ({ depute: deputeIdx.get(m.acteurRef) as number, souhait: m.souhait }))
      .sort((a, b) => a.depute - b.depute || compareText(a.souhait, b.souhait));
    const detail: ScrutinDetail = {
      numero: s.numero,
      places,
      votes: seats.map((m) => m?.vote ?? '.').join(''),
      deputes: seats.map((m) => (m ? (deputeIdx.get(m.acteurRef) as number) : -1)),
      groupes: seats.map((m) => (m ? (groupIdx.get(m.groupeRef) as number) : -1)),
      delegations: seats.flatMap((m, i) => (m?.delegation ? [i] : [])),
      misesAuPoint: souhaits,
      sansPlace: s.unplaced
        .map((m) => ({
          depute: deputeIdx.get(m.acteurRef) as number,
          groupe: groupIdx.get(m.groupeRef) as number,
          vote: m.vote,
          delegation: m.delegation,
        }))
        .sort((a, b) => a.depute - b.depute),
    };
    const summary: ScrutinSummaryDraft = {
      numero: s.numero,
      uid: s.raw.uid,
      date: s.raw.dateScrutin,
      type: s.raw.typeVote.codeTypeVote as ScrutinSummary['type'],
      categorie: s.categorie,
      regles: s.regles,
      titre: s.raw.titre,
      adopte: s.raw.sort.code === 'adopté',
      demandeur: s.raw.demandeur?.texte ?? null,
      synthese: synthese(s.raw),
      groupes: groupDecomptes,
      dossier: dossier
        ? {
            uid: dossier.dossierRef,
            url: `https://www.assemblee-nationale.fr/dyn/17/dossiers/${dossier.dossierRef}`,
          }
        : null,
      delegations: detail.delegations.length + detail.sansPlace.filter((m) => m.delegation).length,
      misesAuPoint: souhaits.length,
    };
    return { summary, detail };
  });

  return {
    groupes,
    deputes,
    scrutins,
    unplaced: seatings.flatMap((s) =>
      s.unplaced.map((m) => ({ numero: s.numero, acteurRef: m.acteurRef, vote: m.vote }))
    ),
  };
};
