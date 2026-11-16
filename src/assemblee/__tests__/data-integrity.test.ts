import fs from 'node:fs';
import path from 'node:path';

import manifest from '@/src/assemblee/data/manifest.json';
import indexData from '@/src/assemblee/data/scrutins-index.json';
import { classifyScrutin, PERIMETER_RULES } from '@/src/assemblee/models/extraction/perimeter';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';
import {
  GROUP_ARC_COLOR,
  GROUP_COLOR_BACKGROUNDS,
  contrastRatio,
  groupArcColor,
} from '@/src/assemblee/models/group-color';
import type {
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';

const index = indexData as unknown as ScrutinIndex;
const PUBLIC_DIR = path.join(process.cwd(), 'public/donnees/assemblee/v1');
const SCRUTINS_DIR = path.join(PUBLIC_DIR, 'scrutins');

const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;
const directory = readJson<DeputeDirectory>(path.join(PUBLIC_DIR, 'deputes.json'));
const detailOf = (numero: number) =>
  readJson<ScrutinDetail>(path.join(SCRUTINS_DIR, `${numero}.json`));
const details = new Map(index.scrutins.map((s) => [s.numero, detailOf(s.numero)]));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Écart connu de la source : le scrutin n° 1 (motion de censure du 8 octobre 2024) annonce 10
 * non-votants dans sa synthèse alors que ses groupes en comptent 21 ; les listes nominatives
 * suivent les groupes. On le signale ici plutôt que de le corriger.
 */
const SYNTHESIS_NON_VOTERS_GAP = new Set([1]);

/**
 * Écarts d'effectif irréductibles (« n° abrégé de groupe rattachés/officiel »). Tout écart nouveau
 * doit être expliqué ici ou corrigé dans l'extraction.
 *  - 5192 (26 janvier 2026) : Mme Rist reprend son mandat le 25 janvier et change de groupe le 26
 *    et le 27 (mandat de groupe « non inscrit » d'un seul jour) ; l'Assemblée ne la compte dans
 *    aucun groupe ce jour-là, l'open data ne permet pas de le déduire.
 *  - 6902 (26 mai 2026) : le groupe NI compte un député de moins que ses mandats ne l'indiquent,
 *    sans changement de mandat ce jour-là : la source ne l'explique pas.
 */
const IRREDUCIBLE_EFFECTIVE_GAPS: string[] = ['6902 NI 11/10', '5192 NI 11/10'];

describe("Feature: intégrité des données de l'Assemblée", () => {
  it('should match the manifest counts and date range', () => {
    const dates = index.scrutins.map((s) => s.date).sort();
    const votes = [...details.values()].reduce(
      (n, d) =>
        n +
        [...d.votes].filter((v) => 'PCAN'.includes(v)).length +
        d.sansPlace.filter((m) => m.vote !== '-').length,
      0
    );
    expect(manifest.scrutins).toBe(index.scrutins.length);
    expect(manifest.votes).toBe(votes);
    expect(manifest.premier).toBe(dates[0]);
    expect(manifest.dernier).toBe(dates[dates.length - 1]);
    expect(manifest.sha256.scrutins).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.sha256.amo).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should list the scrutins from the most recent, one entry per number', () => {
    const dates = index.scrutins.map((s) => s.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(index.scrutins.map((s) => s.numero)).size).toBe(index.scrutins.length);
  });

  it('should satisfy the perimeter rules for every published scrutin', () => {
    for (const s of index.scrutins) {
      const raw = {
        titre: s.titre,
        typeVote: { codeTypeVote: s.type },
        sort: { code: s.adopte ? 'adopté' : 'rejeté' },
      } as RawScrutin;
      const classification = classifyScrutin(raw);
      expect(classification.inclus, `scrutin ${s.numero}`).toBe(true);
      expect(s.regles, `scrutin ${s.numero}`).toEqual(classification.regles);
      expect(s.categorie, `scrutin ${s.numero}`).toBe(classification.categorie);
    }
  });

  it('should write the same closed list of rules in the manifest as in the code', () => {
    expect(manifest.regles).toEqual(PERIMETER_RULES);
  });

  it('should have group totals equal to the synthesis for every scrutin', () => {
    for (const s of index.scrutins) {
      const total = (column: 2 | 3 | 4 | 5) => s.groupes.reduce((n, g) => n + g[column], 0);
      expect(total(2), `pour ${s.numero}`).toBe(s.synthese.pour);
      expect(total(3), `contre ${s.numero}`).toBe(s.synthese.contre);
      expect(total(4), `abstentions ${s.numero}`).toBe(s.synthese.abstentions);
      if (!SYNTHESIS_NON_VOTERS_GAP.has(s.numero)) {
        expect(total(5), `non-votants ${s.numero}`).toBe(s.synthese.nonVotants);
      }
    }
    const gap = index.scrutins.find((s) => s.numero === 1)!;
    expect(gap.groupes.reduce((n, g) => n + g[5], 0)).toBe(21);
    expect(gap.synthese.nonVotants).toBe(10);
  });

  it('should have nominative counts equal to the group totals for every detail file', () => {
    for (const s of index.scrutins) {
      const d = details.get(s.numero)!;
      for (const [groupeIdx, , pour, contre, abstentions, nonVotants] of s.groupes) {
        const count = (vote: string) =>
          d.groupes.filter((g, i) => g === groupeIdx && d.votes[i] === vote).length +
          d.sansPlace.filter((m) => m.groupe === groupeIdx && m.vote === vote).length;
        expect(
          [count('P'), count('C'), count('A'), count('N')],
          `scrutin ${s.numero}, groupe ${groupeIdx}`
        ).toEqual([pour, contre, abstentions, nonVotants]);
      }
    }
  });

  it('should attach to every group exactly its official number of members, except the listed gaps', () => {
    const gaps: string[] = [];
    for (const s of index.scrutins) {
      const d = details.get(s.numero)!;
      for (const [groupeIdx, membres] of s.groupes) {
        const attached =
          d.groupes.filter((g) => g === groupeIdx).length +
          d.sansPlace.filter((m) => m.groupe === groupeIdx).length;
        if (attached !== membres) {
          gaps.push(`${s.numero} ${index.groupes[groupeIdx].abrev} ${attached}/${membres}`);
        }
      }
    }
    expect(gaps).toEqual(IRREDUCIBLE_EFFECTIVE_GAPS);
  });

  it('should keep the detail columns aligned and the places ascending', () => {
    for (const d of details.values()) {
      expect(d.votes).toHaveLength(d.places.length);
      expect(d.deputes).toHaveLength(d.places.length);
      expect(d.groupes).toHaveLength(d.places.length);
      expect(d.places).toEqual([...d.places].sort((a, b) => a - b));
      expect(new Set(d.places).size).toBe(d.places.length);
      expect(d.places[0]).toBeGreaterThanOrEqual(1);
      expect(d.places[d.places.length - 1]).toBeLessThanOrEqual(650);
    }
  });

  it('should use the same places in every detail file, so the schema never moves', () => {
    const [first, ...others] = [...details.values()];
    for (const d of others) expect(d.places).toEqual(first.places);
  });

  it('should resolve every deputy and group index', () => {
    const unresolved: string[] = [];
    for (const d of details.values()) {
      d.votes.split('').forEach((vote, i) => {
        if (vote === '.') {
          if (d.deputes[i] !== -1 || d.groupes[i] !== -1)
            unresolved.push(`vacant ${d.numero}/${i}`);
        } else if (!directory.deputes[d.deputes[i]] || !index.groupes[d.groupes[i]]) {
          unresolved.push(`scrutin ${d.numero}, place ${d.places[i]}`);
        }
      });
      for (const [depute] of d.causes) {
        if (!directory.deputes[depute]) unresolved.push(`cause ${d.numero}/${depute}`);
      }
      for (const m of [...d.misesAuPoint, ...d.sansPlace]) {
        expect(directory.deputes[m.depute]).toBeDefined();
      }
      for (const m of d.sansPlace) expect(index.groupes[m.groupe]).toBeDefined();
      for (const i of d.delegations) expect(d.votes[i]).not.toBe('.');
    }
    expect(unresolved).toEqual([]);
    for (const s of index.scrutins) {
      for (const [groupeIdx] of s.groupes) expect(index.groupes[groupeIdx]).toBeDefined();
    }
  });

  it('should never have a deputy twice in the same scrutin', () => {
    for (const d of details.values()) {
      const all = [...d.deputes.filter((x) => x !== -1), ...d.sansPlace.map((m) => m.depute)];
      expect(new Set(all).size, `scrutin ${d.numero}`).toBe(all.length);
    }
  });

  it('should have no « contre » nor « abstention » in censure motions', () => {
    const motions = index.scrutins.filter((s) => s.type === 'MOC');
    expect(motions.length).toBeGreaterThan(0);
    for (const s of motions) {
      const d = details.get(s.numero)!;
      expect(d.votes, `scrutin ${s.numero}`).not.toMatch(/[CA]/);
      expect(d.sansPlace.filter((m) => m.vote === 'C' || m.vote === 'A')).toEqual([]);
      expect(s.synthese.contre).toBe(0);
      expect(s.synthese.abstentions).toBe(0);
    }
  });

  it('should use ISO 8601 dates everywhere', () => {
    for (const s of index.scrutins) {
      expect(s.date).toMatch(ISO_DATE);
      expect(s.updatedAt).toMatch(ISO_DATE);
    }
    for (const g of index.groupes) {
      expect(g.debut).toMatch(ISO_DATE);
      if (g.fin !== null) expect(g.fin).toMatch(ISO_DATE);
    }
    for (const date of [manifest.extraitLe, manifest.premier, manifest.dernier]) {
      expect(date).toMatch(ISO_DATE);
    }
    for (const date of Object.values(manifest.publieLe)) {
      if (date !== null) expect(date).toMatch(ISO_DATE);
    }
  });

  it('should have a detail file for every indexed scrutin and no orphan', () => {
    const files = fs.readdirSync(SCRUTINS_DIR).sort();
    const expected = index.scrutins.map((s) => `${s.numero}.json`).sort();
    expect(files).toEqual(expected);
  });

  it('should draw every group arc in the same neutral grey, in light and in dark', () => {
    for (const theme of ['light', 'dark'] as const) {
      const colors = index.groupes.map((g) => groupArcColor(g, theme));
      expect(new Set(colors), theme).toEqual(new Set([GROUP_ARC_COLOR[theme]]));
      expect(
        contrastRatio(GROUP_ARC_COLOR[theme], GROUP_COLOR_BACKGROUNDS[theme])
      ).toBeGreaterThanOrEqual(3);
    }
    // Les couleurs officielles restent dans les données : c'est la source.
    for (const g of index.groupes) expect(g.couleurOfficielle).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should keep an annuaire of unique deputies, alphabetically sorted', () => {
    const ids = directory.deputes.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(directory.deputes.length).toBeGreaterThan(500);
    for (const d of directory.deputes) {
      expect(d.nom.length).toBeGreaterThan(0);
      expect(d.alpha.length).toBeGreaterThan(0);
    }
  });

  it('should only link legislative files through their official identifier', () => {
    for (const s of index.scrutins.filter((x) => x.dossier)) {
      expect(s.dossier!.url).toBe(
        `https://www.assemblee-nationale.fr/dyn/17/dossiers/${s.dossier!.uid}`
      );
    }
  });

  it('should flag, without excluding, a single-article text that also has a vote on the whole text', () => {
    const wholeTextDossiers = new Set(
      index.scrutins.filter((s) => s.regles.includes('R1') && s.dossier).map((s) => s.dossier!.uid)
    );
    const overlaps = index.scrutins.filter(
      (s) =>
        s.regles.includes('R2') &&
        !s.regles.includes('R1') &&
        s.dossier &&
        wholeTextDossiers.has(s.dossier.uid)
    );
    if (overlaps.length > 0) {
      console.info(
        `R2 et R1 sur le même dossier : ${overlaps.map((s) => s.numero).join(', ')} (signalé, non exclu)`
      );
    }
    // Les deux scrutins sont publiés : le signalement ne retire rien du périmètre.
    for (const s of overlaps) expect(index.scrutins).toContain(s);
  });
});
