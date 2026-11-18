import assembleeIndex from '@/src/assemblee/data/scrutins-index.json';
import { colorDistance } from '@/src/assemblee/models/group-color';
import { PARTIES } from '@/src/programmes/data/parties';

/** Groupe dont les députés forment l'essentiel du parti ; `null` : aucun groupe à l'Assemblée. */
const GROUPE_OF_PARTY: Record<string, string | null> = {
  lfi: 'LFI-NFP',
  pcf: 'GDR',
  ecologistes: 'ECOS',
  'ps-place-publique': 'SOC',
  renaissance: 'EPR',
  horizons: 'HOR',
  lr: 'DR',
  rn: 'RN',
  reconquete: null,
  'nouvelle-energie': null,
};
const groupColors = new Map(assembleeIndex.groupes.map((g) => [g.abrev, g.couleurOfficielle]));
const PAGE = 'https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle';

describe("Feature: couleurs des partis, alignées sur celles des groupes de l'Assemblée", () => {
  it('should decide the colour of every party, none left out of the table', () => {
    expect(PARTIES.map((p) => p.id).sort()).toEqual(Object.keys(GROUPE_OF_PARTY).sort());
  });

  it.each(PARTIES.map((p) => [p.id, p] as const))(
    "should take the official colour of the party's group, and say where it comes from (%s)",
    (id, party) => {
      const abrev = GROUPE_OF_PARTY[id];
      expect(party.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      if (abrev === null) {
        expect(party.colorSource).toEqual({
          groupe: null,
          text: "Couleur propre au parti, aucun groupe à l'Assemblée",
          source: null,
        });
        return;
      }
      expect(party.color).toBe(groupColors.get(abrev));
      expect(party.colorSource.groupe).toBe(abrev);
      expect(party.colorSource.text).toBe(`Couleur du groupe ${abrev} à l'Assemblée nationale`);
      expect(party.colorSource.source).toMatchObject({ url: PAGE, date: '2026-11-18' });
      expect(party.colorSource.source!.title.length).toBeGreaterThan(3);
    }
  );

  it('should keep the colours of two parties at a ΔE (CIE76) of 15 at least, so that they stay apart in the charts', () => {
    for (const a of PARTIES) {
      for (const b of PARTIES) {
        if (a.id < b.id) {
          expect(colorDistance(a.color, b.color), `${a.id} / ${b.id}`).toBeGreaterThanOrEqual(15);
        }
      }
    }
  });
});
