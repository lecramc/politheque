import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { editorialIssues } from '@/src/programmes/models/editorial-vocabulary';
import { beforeParenthesis } from '@/src/programmes/models/presentation.service';
import { SOURCE_KINDS, type Source } from '@/src/programmes/models/programme.model';

const catalog = buildStaticCatalog();
const { etiquettes, otherParties, candidates, parties } = catalog;
const BLOCS = ['Extrême gauche', 'Gauche', 'Divers', 'Centre', 'Droite', 'Extrême droite'];
const byId = new Map(etiquettes.parties.map((p) => [p.id, p]));
const NOT_CONSTITUTED = ['france-libre', 'les-ruches', 'nous-france'];

const expectValidSource = (source: Source, where: string) => {
  expect(source.url, where).toMatch(/^https:\/\//);
  expect(source.title.length, where).toBeGreaterThan(3);
  expect(source.date, where).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
  expect(SOURCE_KINDS, where).toContain(source.kind);
};

describe('Feature: intégrité des étiquettes des partis', () => {
  it('should give every party with a sheet and every other party with a candidate an entry, once', () => {
    const ids = etiquettes.parties.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const party of parties) expect(byId.has(party.id), party.id).toBe(true);
    for (const party of otherParties.parties) expect(byId.has(party.id), party.id).toBe(true);
    expect(ids).toHaveLength(parties.length + otherParties.parties.length);
  });

  it('should keep the first segment of `family` equal to the press label of the ten parties', () => {
    for (const party of parties) {
      expect(byId.get(party.id)?.press?.label, party.id).toBe(beforeParenthesis(party.family));
    }
  });

  it('should cite the circular of 2 February 2026 as the ground of the ministry classification', () => {
    expect(etiquettes.circular.nor).toBe('INTP2602966C');
    expect(etiquettes.circular.date).toBe('2026-02-02');
    expect(etiquettes.circular.url).toMatch(/^https:\/\//);
  });

  it('should source every classification and explain every null', () => {
    for (const entry of etiquettes.parties) {
      if (entry.ministry) {
        expect(BLOCS, entry.id).toContain(entry.ministry.bloc);
        expect(entry.ministry.sources.length, `${entry.id} ministère`).toBeGreaterThan(0);
        expect(entry.ministryNullReason, entry.id).toBeNull();
      } else {
        expect(entry.ministryNullReason?.length, `${entry.id} ministère null`).toBeGreaterThan(10);
      }
      if (entry.press) {
        expect(entry.press.sources.length, `${entry.id} presse`).toBeGreaterThan(0);
        expect(entry.pressNullReason, entry.id).toBeNull();
      } else {
        expect(entry.pressNullReason?.length, `${entry.id} presse null`).toBeGreaterThan(10);
      }
      if (entry.party) expect(entry.party.sources.length, `${entry.id} parti`).toBeGreaterThan(0);
      const all = [
        ...(entry.ministry?.sources ?? []),
        ...(entry.press?.sources ?? []),
        ...(entry.party?.sources ?? []),
      ];
      for (const source of all) expectValidSource(source, entry.id);
    }
  });

  it('should name scholars only when a scholar or a reference work backs the label, and vice versa', () => {
    for (const { id, press } of etiquettes.parties) {
      if (!press) continue;
      const kinds = press.sources.map((s) => s.kind);
      if (press.scholars.length > 0) {
        expect(
          kinds.some((k) => k === 'politiste' || k === 'encyclopedie'),
          id
        ).toBe(true);
      }
      if (kinds.includes('politiste')) expect(press.scholars.length, id).toBeGreaterThan(0);
    }
  });

  it('should write public texts without evaluative terms or work notes', () => {
    for (const entry of etiquettes.parties) {
      const texts = [
        entry.ministry?.note,
        entry.ministry?.nuance,
        entry.ministryNullReason,
        entry.press?.note,
        entry.pressNullReason,
        entry.party?.text,
      ];
      for (const text of texts.filter((t): t is string => !!t)) {
        expect(editorialIssues(text), `${entry.id}: ${text.slice(0, 40)}`).toEqual([]);
      }
    }
  });

  it('should apply the editor decisions on the small parties without a nominal classification', () => {
    for (const id of ['revolution-permanente', 'npa-revolutionnaires']) {
      const ministry = byId.get(id)!.ministry!;
      expect(ministry.bloc, id).toBe('Extrême gauche');
      expect(ministry.note, id).toMatch(
        /^Nuance attribuée à ses listes de 2026 ; parti non nommé dans la circulaire/
      );
    }
    expect(byId.get('parti-animaliste')!.ministry!.bloc).toBe('Divers');
  });
});

describe('Feature: intégrité des autres partis présentant un candidat', () => {
  const candidateIds = candidates.candidates.map((c) => c.id);

  it('should only list constituted parties with a candidate of the candidates file', () => {
    for (const party of otherParties.parties) {
      expect(NOT_CONSTITUTED, party.id).not.toContain(party.id);
      expect(candidateIds, party.id).toContain(party.candidateId);
    }
    expect(otherParties.parties).toHaveLength(10);
  });

  it('should source every card and invent no missing field', () => {
    for (const party of otherParties.parties) {
      expect(party.description.length, party.id).toBeGreaterThan(20);
      expect(party.sources.length, party.id).toBeGreaterThan(0);
      for (const source of party.sources) expectValidSource(source, party.id);
      expect(editorialIssues(party.description), party.id).toEqual([]);
      for (const field of ['shortName', 'foundedYear', 'leader'] as const) {
        expect(party[field], `${party.id}.${field}`).not.toBeNull();
      }
    }
  });

  it('should name each party as the etiquettes file does', () => {
    for (const party of otherParties.parties) {
      expect(party.name, party.id).toBe(byId.get(party.id)!.name);
    }
  });
});
