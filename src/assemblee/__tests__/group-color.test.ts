import {
  contrastRatio,
  GROUP_COLOR_BACKGROUNDS,
  GROUP_COLOR_FALLBACK,
  groupColor,
} from '@/src/assemblee/models/group-color';

describe('Feature: contraste des couleurs de groupe', () => {
  it('should compute the WCAG contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('should keep the official colour when it contrasts enough with the background', () => {
    expect(groupColor('#313567', GROUP_COLOR_BACKGROUNDS.light)).toEqual({
      color: '#313567',
      official: true,
    });
  });

  it('should fall back on a neutral grey when the official colour is too pale for the background', () => {
    expect(groupColor('#B5E2F9', GROUP_COLOR_BACKGROUNDS.light)).toEqual({
      color: GROUP_COLOR_FALLBACK,
      official: false,
    });
  });

  it('should judge each background on its own : a dark colour fails on the dark background', () => {
    expect(groupColor('#313567', GROUP_COLOR_BACKGROUNDS.dark).official).toBe(false);
  });

  it('should fall back on an invalid colour', () => {
    expect(groupColor('', GROUP_COLOR_BACKGROUNDS.light).official).toBe(false);
  });

  it('should use a fallback grey that is itself readable on every background', () => {
    for (const background of Object.values(GROUP_COLOR_BACKGROUNDS)) {
      expect(contrastRatio(GROUP_COLOR_FALLBACK, background)).toBeGreaterThanOrEqual(3);
    }
  });
});
