import { votePalette } from '@/components/vote-colors';
import { contrastRatio } from '@/src/assemblee/models/group-color';

describe.each(['light', 'dark'] as const)(
  'Feature: couleurs des positions de vote (%s)',
  (mode) => {
    const vote = votePalette[mode];
    const background = { secondary: mode === 'light' ? '#FBF8F3' : '#0E1424' };

    it('should tell « pour » and « contre » apart in grayscale (3:1 at least)', () => {
      expect(contrastRatio(vote.pour, vote.contre)).toBeGreaterThanOrEqual(3);
    });

    it('should keep every drawn mark readable against the page background (3:1 at least)', () => {
      for (const key of ['pour', 'contreMark', 'abstention', 'nonVotant'] as const) {
        expect(contrastRatio(vote[key], background.secondary), key).toBeGreaterThanOrEqual(3);
      }
    });

    it('should avoid green and red, which read as good and bad', () => {
      for (const color of Object.values(vote)) {
        const value = Number.parseInt(color.slice(1), 16);
        const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
        const greenish = g > r + 25 && g > b + 25;
        const reddish = r > g + 60 && r > b + 60;
        expect(greenish || reddish, color).toBe(false);
      }
    });
  }
);
