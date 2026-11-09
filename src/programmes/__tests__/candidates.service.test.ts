import {
  buildCandidateList,
  withdrawalLabel,
  candidatesIntro,
  candidatesRule,
} from '@/src/programmes/models/candidates.service';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { DeclaredCandidate, FaqEntry, Party } from '@/src/programmes/models/programme.model';

const ELECTION = 'presidentielle-2027';

const other = (overrides: Partial<DeclaredCandidate> = {}): DeclaredCandidate => ({
  id: 'teddy-riner',
  name: 'Teddy Riner',
  status: 'declare',
  statusLabel: 'Candidature déclarée',
  date: '2026-11-09',
  affiliation: 'Sans étiquette',
  role: 'Judoka',
  summary: 'Annonce sa candidature.',
  sources: [
    { title: 'Source A', url: 'https://a.example/1', date: '2026-11-09', kind: 'presse' },
    { title: 'Source B', url: 'https://b.example/1', date: '2026-11-09', kind: 'presse' },
  ],
  ...overrides,
});

const party = (
  id: string,
  name: string,
  candidateName: string,
  label = 'Candidat déclaré'
): Party =>
  partyFactory({
    id,
    name,
    candidacies: {
      [ELECTION]: {
        candidateName,
        status: 'declare',
        statusLabel: label,
        candidate: `${candidateName} a déclaré sa candidature.`,
        programmeStatus: '',
        programmeState: 'publie',
        themes: emptyThemes(),
      },
    },
  });

describe('Feature: liste unique des candidats', () => {
  it('should turn a declared candidate outside the ten parties into a list entry without programme link', () => {
    const [entry] = buildCandidateList([], [other()], ELECTION);
    expect(entry).toMatchObject({
      id: 'teddy-riner',
      name: 'Teddy Riner',
      statusLabel: 'Candidature déclarée',
      date: '2026-11-09',
      affiliation: 'Sans étiquette',
      role: 'Judoka',
      summary: 'Annonce sa candidature.',
      programmeHref: null,
    });
  });
});

describe('Feature: libellé de statut identique pour tous', () => {
  it('should give the same status wording to a party candidate and to another candidate with the same status', () => {
    const [a, b] = buildCandidateList(
      [party('lfi', 'La France insoumise', 'Jean-Luc Mélenchon', 'Candidat déclaré')],
      [other()],
      ELECTION
    );
    expect(a.statusLabel).toBe(b.statusLabel);
  });
});

describe('Feature: candidats des dix partis dans la même liste', () => {
  it('should give a party candidate the same shape, with the programme link for the party', () => {
    const entries = buildCandidateList(
      [party('lfi', 'La France insoumise', 'Jean-Luc Mélenchon')],
      [],
      ELECTION
    );
    expect(entries).toEqual([
      {
        id: 'lfi',
        name: 'Jean-Luc Mélenchon',
        statusLabel: 'Candidature déclarée',
        date: null,
        affiliation: 'La France insoumise',
        role: null,
        summary: 'Jean-Luc Mélenchon a déclaré sa candidature.',
        programmeHref: '/partis/lfi/programme-2027',
        sources: [],
      },
    ]);
  });

  it('should ignore a party without candidacy for this election', () => {
    expect(buildCandidateList([partyFactory({ id: 'x' })], [], ELECTION)).toEqual([]);
  });
});

describe('Feature: ordre alphabétique du nom de famille', () => {
  const names = (parties: Party[], others: DeclaredCandidate[]) =>
    buildCandidateList(parties, others, ELECTION).map((e) => e.name);

  it('should sort every candidate by family name, parties and others mixed', () => {
    const parties = [
      party('lfi', 'La France insoumise', 'Jean-Luc Mélenchon'),
      party('rn', 'Rassemblement national', 'Marine Le Pen'),
      party('lr', 'Les Républicains', 'Bruno Retailleau'),
    ];
    const others = [
      other({ id: 'a', name: 'Nathalie Arthaud' }),
      other({ id: 'b', name: 'Francis Lalanne' }),
      other({ id: 'c', name: 'Jean-François Legendre' }),
      other({ id: 'd', name: 'Nicolas Dupont-Aignan' }),
    ];
    expect(names(parties, others)).toEqual([
      'Nathalie Arthaud',
      'Nicolas Dupont-Aignan',
      'Francis Lalanne',
      'Marine Le Pen',
      'Jean-François Legendre',
      'Jean-Luc Mélenchon',
      'Bruno Retailleau',
    ]);
  });

  it('should ignore a lowercase particle (« de », « du ») and be accent-insensitive', () => {
    const others = [
      other({ id: 'a', name: 'Dominique de Villepin' }),
      other({ id: 'b', name: 'Éric Zemmour' }),
      other({ id: 'c', name: 'Louis Aliot' }),
      other({ id: 'd', name: 'Jean Dupont' }),
      other({ id: 'e', name: 'Émile Édouard' }),
    ];
    expect(names([], others)).toEqual([
      'Louis Aliot',
      'Jean Dupont',
      'Émile Édouard',
      'Dominique de Villepin',
      'Éric Zemmour',
    ]);
  });
});

describe('Feature: sources de chaque candidat', () => {
  it('should keep the sources of a declared candidate', () => {
    const [entry] = buildCandidateList([], [other()], ELECTION);
    expect(entry.sources.map((s) => s.url)).toEqual(['https://a.example/1', 'https://b.example/1']);
  });

  it('should take the sources, date and summary of a party candidate from its candidacy, never from the programme', () => {
    const status = {
      title: 'S',
      url: 'https://s.example/1',
      date: '2026-05-03',
      kind: 'presse' as const,
    };
    const p = party('lfi', 'La France insoumise', 'Jean-Luc Mélenchon');
    p.candidacies[ELECTION].themes.economie = {
      summary: '',
      measures: [{ text: 'm1', sources: [{ ...status, url: 'https://programme.example/1' }] }],
    };
    p.candidacies[ELECTION].candidateDate = '2026-05-03';
    p.candidacies[ELECTION].candidateSummary =
      'Jean-Luc Mélenchon a déclaré sa candidature le 3 mai 2026.';
    p.candidacies[ELECTION].candidateSources = [status];
    const [entry] = buildCandidateList([p], [], ELECTION);
    expect(entry.sources).toEqual([status]);
    expect(entry.date).toBe('2026-05-03');
    expect(entry.summary).toBe('Jean-Luc Mélenchon a déclaré sa candidature le 3 mai 2026.');
  });
});

describe('Feature: phrases de contexte de la page', () => {
  const faq = (calculated: FaqEntry['calculated']): FaqEntry[] => [
    {
      id: 'parrainages',
      question: 'Q',
      answer: 'R',
      related: [],
      sources: [],
      lastVerified: '2026-11-08',
      calculated,
    },
  ];

  it('should take the sponsorship deadline from the FAQ calculated date, with its time', () => {
    const intro = candidatesIntro(
      faq([{ label: 'L', date: '2027-03-12', time: '18:00', rule: 'Règle' }])
    );
    expect(intro).toBe(
      "La liste officielle des candidats sera publiée par le Conseil constitutionnel après le dépôt des 500 parrainages, possible jusqu'au vendredi 12 mars 2027, 18 h (date calculée, à confirmer par le décret de convocation)."
    );
  });

  it('should not state a deadline the data does not contain', () => {
    const intro = candidatesIntro(faq(undefined));
    expect(intro).toBe(
      'La liste officielle des candidats sera publiée par le Conseil constitutionnel après le dépôt des 500 parrainages.'
    );
    expect(candidatesIntro([])).toBe(intro);
  });

  it('should state the display rule with the update date', () => {
    expect(candidatesRule('2026-11-09')).toBe(
      'Candidatures déclarées ou annoncées publiquement, attestées par au moins deux sources ; mise à jour le 9 novembre 2026.'
    );
  });
});

describe('Feature: fonction absente', () => {
  it('should expose no role, not a placeholder, when no source gives one', () => {
    const [entry] = buildCandidateList([], [other({ role: '' })], ELECTION);
    expect(entry.role).toBeNull();
  });
});

describe('Feature: date de retrait', () => {
  it('should write « en » before a month and « le » before a full date', () => {
    expect(withdrawalLabel('2026-09')).toBe('Retrait en septembre 2026');
    expect(withdrawalLabel('2026-07-07')).toBe('Retrait le 7 juillet 2026');
  });
});
