import type { PartyAssembleePanel } from '@/src/assemblee/models/party-assemblee';
import { partyAssembleeLine } from '@/src/assemblee/models/party-assemblee-line';

describe("Feature: ligne « À l'Assemblée » de l'en-tête d'une fiche parti", () => {
  it('should give the group, its size, its official color and a link to the votes', () => {
    const panel = {
      kind: 'group',
      title: "À l'Assemblée",
      color: '#123456',
      name: 'Rassemblement National',
      count: '123 députés',
      all: { label: 'Tous', href: '/assemblee' },
    } as PartyAssembleePanel;
    expect(partyAssembleeLine(panel)).toEqual({
      color: '#123456',
      lead: "À l'Assemblée : groupe Rassemblement National · 123 députés",
      link: { label: 'voir ses votes', href: '/assemblee' },
    });
  });

  it('should say there is no group, without color nor link', () => {
    const panel = {
      kind: 'none',
      title: "À l'Assemblée",
      text: "Pas de groupe à l'Assemblée nationale",
    } as PartyAssembleePanel;
    expect(partyAssembleeLine(panel)).toEqual({
      color: null,
      lead: "Pas de groupe à l'Assemblée",
      link: null,
    });
  });
});
