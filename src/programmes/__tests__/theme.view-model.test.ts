import {
  groupeFactory,
  indexFactory,
  scrutinFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Candidacy } from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

const source = {
  title: 'Programme',
  url: 'https://example.org/programme',
  date: '2026-11-10',
  kind: 'programme' as const,
};

const candidacy = (state: Candidacy['programmeState'], withMeasure: boolean): Candidacy => {
  const themes = emptyThemes();
  if (withMeasure) {
    themes.economie = { summary: 'Résumé.', measures: [{ text: 'Mesure.', sources: [source] }] };
  }
  return {
    candidateName: 'X',
    status: 'declare',
    statusLabel: 'Candidat déclaré',
    candidate: 'X',
    programmeStatus: '',
    programmeState: state,
    themes,
  };
};

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'avec',
      name: 'Avec',
      candidacies: { 'presidentielle-2027': candidacy('publie', true) },
    }),
    partyFactory({
      id: 'partiel',
      name: 'Partiel',
      candidacies: { 'presidentielle-2027': candidacy('partiel', false) },
    }),
    partyFactory({
      id: 'sans',
      name: 'Sans',
      candidacies: { 'presidentielle-2027': candidacy('non-publie', false) },
    }),
  ],
});
const vm = () =>
  themeViewModel('economie')({ dispatch: vi.fn() })(stateBuilder().withCatalog(catalog).build());

describe('Feature: propositions des partis sur un débat', () => {
  it('should list measures, say nothing is published on the theme, or say the programme is not published', () => {
    expect(vm().comparisons.map((c) => [c.party.id, c.programme?.kind])).toEqual([
      ['avec', 'mesures'],
      ['partiel', 'rien'],
      ['sans', 'non-publie'],
    ]);
  });

  it('should cite only the sources of the measures that are listed', () => {
    expect(vm().measureSources).toEqual([source]);
  });
});

describe("Feature: ce qu'a voté l'Assemblée sur un débat", () => {
  const cite = (numero: number) => ({
    stance: 1 as const,
    justification: '',
    sources: [
      {
        title: 'Scrutin',
        url: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}`,
        date: '2026-11-10',
        kind: 'vote' as const,
      },
    ],
  });
  const votingCatalog = catalogFactory({
    guide: [{ id: 'comment-une-loi-est-votee' } as never],
    parties: [
      partyFactory({ id: 'a', name: 'A', stances: { q1: cite(7), q2: cite(99) } }),
      partyFactory({ id: 'b', name: 'B', stances: { q1: cite(7), q3: cite(8) } }),
    ],
  });
  const index = indexFactory({
    groupes: [groupeFactory({ abrev: 'GA', libelle: 'Groupe A' })],
    scrutins: [
      scrutinFactory({ numero: 7, date: '2026-11-01', groupes: [[0, 20, 15, 0, 0, 0]] }),
      scrutinFactory({ numero: 8, date: '2026-11-02', groupes: [[0, 20, 0, 15, 0, 0]] }),
    ],
  });
  const withVotes = (catalog = votingCatalog) =>
    themeViewModel('economie')({ dispatch: vi.fn() })(
      assembleeStateBuilder(stateBuilder().withCatalog(catalog).build()).withIndex(index).build()
    );

  it('should give a grid of the distinct votes cited by the parties on the questions of the theme', () => {
    const { assembleeVotes } = withVotes();
    expect(assembleeVotes?.title).toBe("Ce qu'a voté l'Assemblée sur ce sujet");
    expect(assembleeVotes?.grid.columns.map((c) => c.numero)).toEqual([8, 7]);
    expect(assembleeVotes?.grid.rows[0].cells.map((c) => c.label)).toEqual(['Contre', 'Pour']);
    expect(assembleeVotes?.all.href).toBe('/assemblee');
    expect(assembleeVotes?.law?.href).toBe('/comprendre/comment-une-loi-est-votee');
  });

  it('should offer the lesson on how a law is voted only when the guide has it', () => {
    const noLesson = withVotes({ ...votingCatalog, guide: [] });
    expect(noLesson.assembleeVotes?.law).toBeNull();
  });

  it('should show no section when no cited vote is in the data, or on another theme', () => {
    expect(vm().assembleeVotes).toBeNull();
    const other = themeViewModel('travail')({ dispatch: vi.fn() })(
      assembleeStateBuilder(stateBuilder().withCatalog(votingCatalog).build())
        .withIndex(index)
        .build()
    );
    expect(other.assembleeVotes).toBeNull();
  });
});
