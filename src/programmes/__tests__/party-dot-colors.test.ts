import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { contrastRatio } from '@/src/core/utils/color-contrast';
import { initialTextColor } from '@/src/programmes/models/party-dot-colors';

describe('Feature: initiale lisible sur la pastille de parti', () => {
  it('should write white on a dark party colour', () => {
    expect(initialTextColor('#313567')).toBe('#FFFFFF');
    expect(initialTextColor('#1F1F3D')).toBe('#FFFFFF');
  });

  it('should write near-black on a light party colour', () => {
    expect(initialTextColor('#B5E2F9')).toBe('#111111');
    expect(initialTextColor('#F5B4CE')).toBe('#111111');
  });

  it('should keep every party initial readable (contrast of at least 4.5)', () => {
    const dir = join(__dirname, '../data/parties');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const { color } = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { color?: string };
      if (!color) continue;
      expect(contrastRatio(color, initialTextColor(color)), file).toBeGreaterThanOrEqual(4.5);
    }
  });
});
