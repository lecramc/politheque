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
