import { needsStrongOutline } from '@/src/core/utils/color-contrast';

// Fonds d'écran du thème clair (crème) et sombre (nuit), `background.secondary` et `surface.primary`.
const backgrounds = ['#FBF8F3', '#FFFFFF', '#0E1424', '#161E33'];

describe('Feature: contour des marques de couleur officielle', () => {
  it('should strengthen the outline of very dark colours on the night background', () => {
    for (const color of ['#313567', '#1F1F3D', '#1D257A', '#830E21']) {
      expect(needsStrongOutline(color, backgrounds)).toBe(true);
    }
  });

  it('should strengthen the outline of very light colours on the cream background', () => {
    for (const color of ['#B5E2F9', '#F5B4CE', '#FFD96F']) {
      expect(needsStrongOutline(color, backgrounds)).toBe(true);
    }
  });

  it('should keep the normal outline for colours that stand out on both backgrounds', () => {
    expect(needsStrongOutline('#E4002B', backgrounds)).toBe(false);
    expect(needsStrongOutline('#2D8CFF', backgrounds)).toBe(false);
  });
});
