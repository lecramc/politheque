import { rawActeurs, rawOrganes } from '@/src/assemblee/__tests__/fixtures/raw-amo.fixtures';
import {
  groupVote,
  GROUPE_A,
  motionCensure,
  rawScrutin,
  spoAmendement,
  spoArticleUniqueLoi,
  spsEnsemble,
  votant,
} from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import { parseActeur, parseGroupe } from '@/src/assemblee/models/extraction/amo';
import { compactDataset, type Dataset } from '@/src/assemblee/models/extraction/compact';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';

const input = (scrutins: RawScrutin[]) => ({
  scrutins,
  acteurs: rawActeurs().flatMap((a) => parseActeur(a) ?? []),
  groupes: rawOrganes().flatMap((o) => parseGroupe(o) ?? []),
});

const build = (scrutins: RawScrutin[] = [spsEnsemble(), motionCensure()]): Dataset =>
  compactDataset(input(scrutins));

/** Lecture d'un siège : { vote, depute, groupe, place } pour une place donnée. */
const seatOf = (dataset: Dataset, numero: number, place: number) => {
  const detail = dataset.scrutins.find((s) => s.summary.numero === numero)!.detail;
  const i = detail.places.indexOf(place);
  return {
    vote: detail.votes[i],
    depute: detail.deputes[i] === -1 ? null : dataset.deputes[detail.deputes[i]].id,
    groupe: detail.groupes[i] === -1 ? null : dataset.groupes[detail.groupes[i]].abrev,
    delegation: detail.delegations.includes(i),
  };
};

describe('Feature: extraction compacte — détail nominatif', () => {
  it('should list every place observed over the legislature, in ascending order, for every scrutin', () => {
    const dataset = build();
    for (const { detail } of dataset.scrutins) {
      expect(detail.places).toEqual([10, 11, 150, 151, 300, 301, 400]);
      expect(detail.votes).toHaveLength(7);
      expect(detail.deputes).toHaveLength(7);
      expect(detail.groupes).toHaveLength(7);
    }
  });

  it('should keep the official votes of the deputies who voted', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 10)).toMatchObject({ vote: 'P', depute: 'dep1', groupe: 'GA' });
    expect(seatOf(dataset, 10, 150)).toMatchObject({ vote: 'C', depute: 'dep3', groupe: 'GB' });
    expect(seatOf(dataset, 10, 151)).toMatchObject({ vote: 'A', depute: 'dep4' });
    expect(seatOf(dataset, 10, 300)).toMatchObject({ vote: 'N', depute: 'dep5', groupe: 'GC' });
  });

  it('should mark a delegated vote', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 10).delegation).toBe(true);
    expect(seatOf(dataset, 10, 11).delegation).toBe(false);
  });

  it('should keep the official vote and list the mise au point separately', () => {
    const dataset = build();
    const detail = dataset.scrutins[0].detail;
    const dep3 = dataset.deputes.findIndex((d) => d.id === 'dep3');
    expect(seatOf(dataset, 10, 150).vote).toBe('C');
    expect(detail.misesAuPoint).toEqual([{ depute: dep3, souhait: 'P' }]);
  });

  it('should mark sitting deputies absent from every list as « pas de vote enregistré »', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 301)).toMatchObject({ vote: '-', depute: 'dep6', groupe: 'GC' });
  });

  it('should mark a seat with no sitting deputy as vacant', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 400)).toEqual({
      vote: '.',
      depute: null,
      groupe: null,
      delegation: false,
    });
  });

  it('should attach each vote to the group of the day, not the current group', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 301).groupe).toBe('GC');
    expect(seatOf(dataset, 20, 301).groupe).toBe('GA');
  });

  it('should follow a replacement : the seat belongs to the deputy sitting that day', () => {
    const dataset = build();
    expect(seatOf(dataset, 10, 11)).toMatchObject({ depute: 'dep2', vote: 'P' });
    expect(seatOf(dataset, 20, 11)).toMatchObject({ depute: 'dep7', vote: 'P' });
  });

  it('should list only « pour » for a censure motion and never infer « contre »', () => {
    const dataset = build();
    expect(seatOf(dataset, 20, 10).vote).toBe('P');
    expect(seatOf(dataset, 20, 150).vote).toBe('-');
    expect(seatOf(dataset, 20, 300).vote).toBe('-');
    const votes = dataset.scrutins.find((s) => s.summary.numero === 20)!.detail.votes;
    expect(votes).not.toMatch(/[CA]/);
  });

  it('should never seat a deputy twice in a scrutin', () => {
    for (const { detail } of build().scrutins) {
      const seated = detail.deputes.filter((d) => d !== -1);
      expect(new Set(seated).size).toBe(seated.length);
    }
  });

  it('should keep one directory entry per deputy, sorted, with the details pointing into it', () => {
    const dataset = build();
    expect(dataset.deputes.map((d) => d.id)).toEqual([
      'dep1',
      'dep2',
      'dep3',
      'dep4',
      'dep5',
      'dep6',
      'dep7',
      'dep9',
    ]);
    expect(dataset.deputes[0]).toEqual({
      id: 'dep1',
      civ: 'Mme',
      prenom: 'Prénom-dep1',
      nom: 'Nom-dep1',
      alpha: 'Nom-dep1',
      departement: 'Nord',
      circonscription: 3,
    });
  });

  it('should count the votes recorded in each scrutin', () => {
    const detail = build().scrutins[0].detail;
    const recorded = [...detail.votes].filter((v) => 'PCAN'.includes(v)).length;
    expect(recorded).toBe(5);
  });

  it('should list apart a deputy with no free seat known, without losing the vote nor inventing a seat', () => {
    // dep1 vote sans numéro de place, n'a jamais voté ailleurs et son mandat ne porte pas de place
    const scrutin = rawScrutin({
      numero: 10,
      date: '2025-03-10',
      type: 'SPS',
      titre: "l'ensemble du projet de loi X.",
      groupes: [groupVote(GROUPE_A, 2, { pours: [votant('dep1', null, true)] })],
    });
    const data = input([scrutin]);
    data.acteurs = data.acteurs.map((a) => (a.id === 'dep1' ? { ...a, placeHemicycle: null } : a));
    const dataset = compactDataset(data);
    const { detail } = dataset.scrutins[0];
    const dep1 = dataset.deputes.findIndex((d) => d.id === 'dep1');
    expect(detail.sansPlace).toEqual([{ depute: dep1, groupe: 0, vote: 'P', delegation: true }]);
    expect(detail.deputes).not.toContain(dep1);
    expect(dataset.unplaced).toEqual([{ numero: 10, acteurRef: 'dep1', vote: 'P' }]);
  });

  it('should fail loudly when a voter is unknown to the actor directory', () => {
    const data = input([spsEnsemble()]);
    data.acteurs = data.acteurs.filter((a) => a.id !== 'dep1');
    expect(() => compactDataset(data)).toThrow(/dep1/);
  });
});

describe('Feature: extraction compacte — déterminisme', () => {
  it('should produce identical output from identical input', () => {
    expect(JSON.stringify(build())).toBe(JSON.stringify(build()));
  });

  it('should not depend on the order of the input files', () => {
    const forward = compactDataset(input([spsEnsemble(), motionCensure(), spoArticleUniqueLoi()]));
    const reversed = compactDataset({
      ...input([spoArticleUniqueLoi(), motionCensure(), spoAmendement(), spsEnsemble()]),
      acteurs: input([]).acteurs.reverse(),
      groupes: input([]).groupes.reverse(),
    });
    expect(JSON.stringify(reversed)).toBe(JSON.stringify(forward));
  });
});
