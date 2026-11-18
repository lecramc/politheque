import { GROUP_FALLBACK_COLOR, groupColor } from '@/src/assemblee/models/group-color';
import { groupeFactory } from '@/src/assemblee/models/scrutin.factory';
import { colorDistance, contrastRatio } from '@/src/core/utils/color-contrast';

describe('Feature: couleurs des groupes', () => {
  it('should compute the WCAG contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('should compute a perceptual distance between two colours (CIE76), zero for the same colour', () => {
    expect(colorDistance('#336699', '#336699')).toBeCloseTo(0, 5);
    expect(colorDistance('#000000', '#FFFFFF')).toBeCloseTo(100, 0);
    expect(colorDistance('#313567', '#000000')).toBeGreaterThan(20);
  });

  it('should give each group its official Assembly colour, the same rule for all groups', () => {
    for (const couleurOfficielle of ['#C00D0D', '#313567', '#FFD96F', '#B5E2F9']) {
      expect(groupColor(groupeFactory({ couleurOfficielle }))).toBe(couleurOfficielle);
    }
  });

  it('should fall back on a neutral grey when the official colour is missing or malformed', () => {
    for (const couleurOfficielle of ['', 'rouge', '#12']) {
      expect(groupColor(groupeFactory({ couleurOfficielle }))).toBe(GROUP_FALLBACK_COLOR);
    }
    const value = Number.parseInt(GROUP_FALLBACK_COLOR.slice(1), 16);
    const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    expect(Math.max(...channels) - Math.min(...channels)).toBeLessThanOrEqual(16);
  });
});
