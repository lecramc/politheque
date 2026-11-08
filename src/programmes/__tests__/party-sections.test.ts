import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { legalDossierFactory } from '@/src/programmes/models/legal/legal.factory';
import { partyFactory } from '@/src/programmes/models/party.factory';
import {
  availableSections,
  hasLegalSection,
  PARTY_SECTIONS,
  legacyTabRedirect,
  partyHref,
  sectionFromPath,
} from '@/src/programmes/models/seo/party-sections';

const history = { founded: '2016', origins: { text: '', sources: [] }, ideals: [], timeline: [] };
const candidacy = {
  candidateName: 'X',
  status: 'declare' as const,
  statusLabel: 'Candidat déclaré',
  candidate: '',
  programmeStatus: '',
  programmeState: 'non-publie' as const,
  themes: {} as never,
};

describe('Feature: sections de la fiche parti', () => {
  it('should build the programme href on its own segment, as every other section', () => {
    expect(partyHref('rn')).toBe('/partis/rn/programme-2027');
    expect(partyHref('rn', 'programme')).toBe('/partis/rn/programme-2027');
    expect(partyHref('rn', 'histoire')).toBe('/partis/rn/histoire');
    expect(partyHref('rn', 'positions')).toBe('/partis/rn/positions');
  });

  it('should read the active section from the pathname, programme by default', () => {
    expect(sectionFromPath('/partis/rn/histoire')).toBe('histoire');
    expect(sectionFromPath('/partis/rn/positions')).toBe('positions');
    expect(sectionFromPath('/partis/rn/programme-2027')).toBe('programme');
    expect(sectionFromPath('/partis/rn')).toBe('programme');
  });

  it('should return null for a pathname outside a party page', () => {
    expect(sectionFromPath('/partis')).toBeNull();
    expect(sectionFromPath('/debats/economie')).toBeNull();
    expect(sectionFromPath('/partis/rn/inconnue')).toBeNull();
  });

  it('should send every legacy onglet value straight to its final address, without a chain', () => {
    expect(legacyTabRedirect('rn', 'histoire')).toBe('/partis/rn/histoire');
    expect(legacyTabRedirect('rn', 'positions')).toBe('/partis/rn/positions');
    expect(legacyTabRedirect('rn', 'programme')).toBe('/partis/rn/programme-2027');
    expect(legacyTabRedirect('rn', 'bref')).toBe('/partis/rn/programme-2027');
  });

  it('should ignore unknown onglet values', () => {
    expect(legacyTabRedirect('rn', 'autre')).toBeNull();
    expect(legacyTabRedirect('rn', undefined)).toBeNull();
  });

  it('should offer the same sections to every party with the same data', () => {
    const full = { history, candidacies: { 'presidentielle-2027': candidacy } };
    const a = availableSections(partyFactory({ id: 'a', ...full }), 'presidentielle-2027');
    const b = availableSections(partyFactory({ id: 'b', ...full }), 'presidentielle-2027');
    expect(a).toEqual(['programme', 'positions', 'histoire']);
    expect(b).toEqual(a);
  });

  it('should hide programme and history tabs when the party has no such data', () => {
    expect(availableSections(partyFactory(), 'presidentielle-2027')).toEqual(['positions']);
  });

  it('should add the procedures tab last with segment procedures-judiciaires', () => {
    expect(PARTY_SECTIONS.at(-1)).toEqual({
      id: 'procedures',
      label: 'Procédures judiciaires',
      tabLabel: 'Procédures',
      segment: 'procedures-judiciaires',
    });
    expect(partyHref('rn', 'procedures')).toBe('/partis/rn/procedures-judiciaires');
    expect(sectionFromPath('/partis/rn/procedures-judiciaires')).toBe('procedures');
  });

  it('should offer procedures to every party when dossiers are published, to none otherwise', () => {
    const parties = [partyFactory({ id: 'a' }), partyFactory({ id: 'b', history })];
    for (const party of parties) {
      expect(availableSections(party, null, true).at(-1)).toBe('procedures');
      expect(availableSections(party, null, false)).not.toContain('procedures');
      expect(availableSections(party, null)).not.toContain('procedures');
    }
    const dossier = legalDossierFactory;
    const catalog = (legalIds: string[]) =>
      catalogFactory({
        parties,
        legal: legalIds.map((partyId) => dossier({ partyId })),
      });
    expect(hasLegalSection(catalog([]))).toBe(false);
    expect(hasLegalSection(catalog(['a']))).toBe(false);
    expect(hasLegalSection(catalog(['a', 'b']))).toBe(true);
  });

  it('should order the four tabs Programme, Positions, Histoire, Procédures', () => {
    expect(PARTY_SECTIONS.map((s) => s.tabLabel)).toEqual([
      'Programme',
      'Positions',
      'Histoire',
      'Procédures',
    ]);
  });
});
