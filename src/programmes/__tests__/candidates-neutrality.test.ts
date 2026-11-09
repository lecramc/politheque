import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import {
  buildCandidateList,
  sortKeyOf,
  type CandidateEntry,
} from '@/src/programmes/models/candidates.service';
import { SOURCE_KINDS } from '@/src/programmes/models/programme.model';

const catalog = buildStaticCatalog();
const { candidates } = catalog;
const ELECTION = candidates.electionId;
const entries = buildCandidateList(catalog.parties, candidates.candidates, ELECTION);
const ISO_DAY_OR_MONTH = /^\d{4}-\d{2}(-\d{2})?$/;

describe('Feature: neutralité de la liste des candidats', () => {
  it('should give every candidate the same structure, whether or not a party sheet exists', () => {
    const shapes = new Set(entries.map((e) => Object.keys(e).sort().join(',')));
    expect([...shapes]).toHaveLength(1);
  });

  it('should carry no colour, score or poll field in any entry', () => {
    const forbidden = /color|couleur|score|poll|sondage|rank|rang|intention/i;
    for (const entry of entries) {
      expect(
        Object.keys(entry).filter((k) => forbidden.test(k)),
        entry.id
      ).toEqual([]);
    }
  });

  it('should list every candidate of the ten parties and of the data file, once', () => {
    const fromParties = catalog.parties.filter((p) => p.candidacies[ELECTION]).length;
    expect(entries).toHaveLength(fromParties + candidates.candidates.length);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
  });

  it('should sort the whole list alphabetically by family name', () => {
    const keys = entries.map((e) => sortKeyOf(e.name));
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b, 'fr')));
  });

  it('should link a programme page for party candidates only, with the same target pattern', () => {
    const linked = entries.filter((e: CandidateEntry) => e.programmeHref);
    for (const entry of linked) {
      expect(entry.programmeHref).toBe(`/partis/${entry.id}/programme-2027`);
    }
    expect(linked).toHaveLength(catalog.parties.filter((p) => p.candidacies[ELECTION]).length);
  });
});

describe('Feature: intégrité des données des autres candidats', () => {
  it('should attest every declared candidate with at least two distinct sources', () => {
    for (const c of candidates.candidates) {
      expect(new Set(c.sources.map((s) => s.url)).size, c.id).toBeGreaterThanOrEqual(2);
      for (const s of c.sources) expect(SOURCE_KINDS, `${c.id} ${s.url}`).toContain(s.kind);
    }
  });

  it('should use valid statuses and ISO dates, and no id shared with a party', () => {
    for (const c of candidates.candidates) {
      expect(['declare', 'intention', 'investi', 'designe'], c.id).toContain(c.status);
      expect(c.date, c.id).toMatch(ISO_DAY_OR_MONTH);
      expect(
        catalog.parties.map((p) => p.id),
        c.id
      ).not.toContain(c.id);
    }
    expect(candidates.lastVerified).toMatch(ISO_DAY_OR_MONTH);
  });

  it('should not repeat a candidate of the ten parties in the data file', () => {
    const partyNames = catalog.parties.flatMap((p) => p.candidacies[ELECTION]?.candidateName ?? []);
    for (const c of candidates.candidates) expect(partyNames, c.id).not.toContain(c.name);
  });
});
