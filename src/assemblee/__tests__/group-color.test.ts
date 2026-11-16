import {
  colorDistance,
  contrastRatio,
  GROUP_ARC_COLOR,
  GROUP_COLOR_BACKGROUNDS,
  groupArcColor,
} from '@/src/assemblee/models/group-color';
import { groupeFactory } from '@/src/assemblee/models/scrutin.factory';

describe('Feature: couleurs neutres des groupes', () => {
  it('should compute the WCAG contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('should compute a perceptual distance between two colours (CIE76), zero for the same colour', () => {
    expect(colorDistance('#336699', '#336699')).toBeCloseTo(0, 5);
    expect(colorDistance('#000000', '#FFFFFF')).toBeCloseTo(100, 0);
    expect(colorDistance('#313567', '#000000')).toBeGreaterThan(20);
  });

  it('should draw every group arc in the same neutral colour, whatever its official colour', () => {
    for (const theme of ['light', 'dark'] as const) {
      const colors = ['#C00D0D', '#313567', '#FFD96F', '', '#3367A7'].map((couleurOfficielle) =>
        groupArcColor(groupeFactory({ couleurOfficielle }), theme)
      );
      expect(new Set(colors)).toEqual(new Set([GROUP_ARC_COLOR[theme]]));
    }
  });

  it('should keep the neutral arc colour readable on its background (3:1 at least)', () => {
    expect(
      contrastRatio(GROUP_ARC_COLOR.light, GROUP_COLOR_BACKGROUNDS.light)
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(GROUP_ARC_COLOR.dark, GROUP_COLOR_BACKGROUNDS.dark)
    ).toBeGreaterThanOrEqual(3);
  });

  it('should be a grey: no hue that could recall a group or a party', () => {
    for (const color of Object.values(GROUP_ARC_COLOR)) {
      const value = Number.parseInt(color.slice(1), 16);
      const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(8);
    }
  });
});
