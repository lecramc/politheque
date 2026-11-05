import {
  STANCE_LABEL,
  STANCE_SCALE,
  STANCE_SHORT_LABEL,
} from '@/src/programmes/models/stance-labels';

describe('Feature: libellés de position', () => {
  it('should keep the full label « Pas de position claire » for screen readers', () => {
    expect(STANCE_LABEL['null']).toBe('Pas de position claire');
  });

  it('should shorten only the missing-position label in lists', () => {
    expect(STANCE_SHORT_LABEL['null']).toBe('Pas de position');
    for (const key of ['2', '1', '0', '-1', '-2']) {
      expect(STANCE_SHORT_LABEL[key]).toBe(STANCE_LABEL[key]);
    }
  });

  it('should keep every short label within 16 characters so it fits the fixed cell on one line', () => {
    for (const label of Object.values(STANCE_SHORT_LABEL)) {
      expect(label.length).toBeLessThanOrEqual(16);
    }
  });

  it('should list the whole scale in a fixed order, from « Pour » to the missing position', () => {
    expect(STANCE_SCALE).toEqual([2, 1, 0, -1, -2, null]);
  });
});
