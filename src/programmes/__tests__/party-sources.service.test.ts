import { PARTIES } from '@/src/programmes/data/parties';
import { partySectionSources } from '@/src/programmes/models/party-sources.service';
import { partyFactory } from '@/src/programmes/models/party.factory';
import type { Source } from '@/src/programmes/models/programme.model';

const src = (title: string): Source => ({
  title,
  url: `https://exemple.fr/${title}`,
  date: '2026-01-01',
  kind: 'presse',
});

const party = partyFactory({
  history: {
    founded: '2016',
    origins: { text: '', sources: [src('origines')] },
    ideals: [
      { title: 'ideal1', text: '', sources: [src('ideal1')] },
      { title: 'ideal2', text: '', sources: [src('ideal2')] },
      { title: 'ideal3', text: '', sources: [src('ideal3')] },
      { title: 'ideal4', text: '', sources: [src('ideal4')] },
    ],
    timeline: [{ date: '2016', event: '', sources: [src('repere')] }],
    whyCreated: { text: '', sources: [src('pourquoi')] },
    figures: [{ name: 'F', role: '', background: '', sources: [src('figure')] }],
    thought: [{ title: 'courant', text: '', sources: [src('courant')] }],
  },
  stances: { q1: { stance: 1, justification: '', sources: [src('position')] } },
  candidacies: {
    'presidentielle-2027': {
      candidateName: 'X',
      status: 'declare',
      statusLabel: '',
      candidate: '',
      programmeStatus: '',
      themes: {
        economie: { summary: '', measures: [{ text: '', sources: [src('mesure')] }] },
      } as never,
    },
  },
});

const titles = (sources: Source[]) => sources.map((s) => s.title);

describe("Feature: sources d'une section de fiche", () => {
  it('should list history sources on the history section only', () => {
    const history = titles(partySectionSources(party, 'histoire', 'presidentielle-2027'));
    expect(history).toEqual(['origines', 'repere', 'pourquoi', 'figure', 'courant']);
    expect(titles(partySectionSources(party, 'positions', 'presidentielle-2027'))).not.toContain(
      'origines'
    );
  });

  it('should list the first three ideals on the overview', () => {
    expect(titles(partySectionSources(party, 'en-bref', 'presidentielle-2027'))).toEqual([
      'ideal1',
      'ideal2',
      'ideal3',
    ]);
  });

  it('should list stance sources on the positions section', () => {
    expect(titles(partySectionSources(party, 'positions', 'presidentielle-2027'))).toEqual([
      'position',
    ]);
  });

  it('should list programme measure sources on the 2027 section', () => {
    expect(titles(partySectionSources(party, 'programme-2027', 'presidentielle-2027'))).toEqual([
      'mesure',
    ]);
    expect(partySectionSources(party, 'programme-2027', null)).toEqual([]);
  });

  it('should source every real party section that the page displays', () => {
    for (const real of PARTIES) {
      for (const section of ['histoire', 'positions', 'programme-2027'] as const) {
        expect(
          partySectionSources(real, section, 'presidentielle-2027').length,
          `${real.id} ${section}`
        ).toBeGreaterThan(0);
      }
    }
  });
});
