import { catalogFactory, electionFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { electionViewModel } from '@/src/programmes/view-models/elections.view-model';

const election = electionFactory({
  keyDates: [
    {
      label: "Date limite d'inscription sur les listes électorales",
      date: '2027-03-12',
      sources: [],
    },
  ],
  rounds: [
    { label: '1er tour', date: '2027-04-18', sources: [] },
    { label: '2nd tour', date: '2027-05-02', sources: [] },
  ],
});
const vmOf = () =>
  electionViewModel('presidentielle-2027', new Date('2026-11-08T10:00:00Z'))({ dispatch: vi.fn() })(
    stateBuilder()
      .withCatalog(catalogFactory({ elections: [election] }))
      .build()
  );

describe('Feature: page de l’élection (dates, puis comment voter, puis candidatures)', () => {
  it('should list the four dates once, in date order', () => {
    expect(vmOf().dates.map((d) => d.date)).toEqual(['2027-03-12', '2027-04-18', '2027-05-02']);
  });

  it('should explain how to vote in three gestures and point to the guide for the detail', () => {
    const vm = vmOf();
    expect(vm.voteSteps).toHaveLength(3);
    expect(vm.voteGuide.href).toBe('/comprendre/comment-voter');
  });

  it('should point to the full list of declared candidates from the candidacies section', () => {
    expect(vmOf().contentLinks?.candidates).toBe('/elections/presidentielle-2027/candidats');
  });

  it('should lead the candidacies section to the full list first, with its count', () => {
    const withCandidate = catalogFactory({ elections: [election] });
    withCandidate.candidates.candidates.push({
      id: 'jean',
      name: 'Jean Dupont',
      status: 'declare',
      statusLabel: 'Candidature déclarée',
      date: '2026-05-01',
      affiliation: 'Sans étiquette',
      role: '',
      summary: '',
      sources: [],
    });
    const vm = electionViewModel('presidentielle-2027')({ dispatch: vi.fn() })(
      stateBuilder().withCatalog(withCandidate).build()
    );
    expect(vm.candidatesEntry).toEqual({
      count: 1,
      href: '/elections/presidentielle-2027/candidats',
      label: 'Présidentielle 2027 : 1 candidature',
    });
  });
});
