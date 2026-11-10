import { votePalette } from '@/components/vote-colors';
import index from '@/src/assemblee/data/scrutins-index.json';
import {
  colorDistance,
  contrastRatio,
  GROUP_COLOR_BACKGROUNDS,
} from '@/src/assemblee/models/group-color';

/**
 * Critère de distinction entre « pour » et une couleur officielle de groupe : distance CIE76
 * (ΔE) d'au moins 20, soit une différence nettement visible. Le « pour » est un gris
 * anthracite (clair) ou quasi blanc (sombre) : aucune parenté avec les bleus du RN (#313567) ou
 * de l'UDR (#3367A7), ni avec aucune autre couleur de groupe. La forme porte l'information.
 */
const MIN_DISTANCE_FROM_OFFICIAL = 20;

const officialColors = [...new Set(index.groupes.map((g) => g.couleurOfficielle))];

describe.each(['light', 'dark'] as const)(
  'Feature: couleurs des positions de vote (%s)',
  (mode) => {
    const vote = votePalette[mode];
    /** Fond de page et fond de carte les plus défavorables du thème. */
    const backgrounds = [GROUP_COLOR_BACKGROUNDS[mode], mode === 'light' ? '#FBF8F3' : '#0E1424'];

    it('should tell « pour » and « contre » apart in grayscale (3:1 at least)', () => {
      expect(contrastRatio(vote.pour, vote.contre)).toBeGreaterThanOrEqual(3);
    });

    it('should keep every drawn symbol readable against the page background (3:1 at least), « pas de vote » included', () => {
      for (const key of ['pour', 'contreMark', 'abstention', 'nonVotant', 'aucun'] as const) {
        for (const background of backgrounds) {
          expect(
            contrastRatio(vote[key], background),
            `${key} sur ${background}`
          ).toBeGreaterThanOrEqual(3);
        }
      }
    });

    it('should keep « pour » clearly away from every official group colour', () => {
      expect(officialColors.length).toBeGreaterThan(5);
      for (const official of officialColors) {
        expect(colorDistance(vote.pour, official), `pour / ${official}`).toBeGreaterThanOrEqual(
          MIN_DISTANCE_FROM_OFFICIAL
        );
      }
      for (const blue of ['#313567', '#3367A7']) {
        expect(colorDistance(vote.pour, blue)).toBeGreaterThanOrEqual(MIN_DISTANCE_FROM_OFFICIAL);
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
