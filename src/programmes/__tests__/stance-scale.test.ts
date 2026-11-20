import { SEAT_GLYPHS } from '@/src/assemblee/models/seat-view';
import { STANCE_LABEL } from '@/src/programmes/models/stance-labels';
import {
  glyphOfStance,
  groupByStance,
  scaleValueOfStance,
  STANCE_SCALE_ENTRIES,
  toneOfStance,
} from '@/src/programmes/models/stance-scale';

describe('Feature: grammaire visuelle pour / contre', () => {
  it('should draw « pour » and « contre » the same way for a party position and for a vote', () => {
    expect(glyphOfStance(2)).toBe(SEAT_GLYPHS.P);
    expect(glyphOfStance(-2)).toBe(SEAT_GLYPHS.C);
    expect(toneOfStance(2)).toBe('pour');
    expect(toneOfStance(-2)).toBe('contre');
  });

  it('should make « plutôt » a visible variant of the same family, never the same sign', () => {
    expect(glyphOfStance(1)).not.toBe(glyphOfStance(2));
    expect(glyphOfStance(-1)).not.toBe(glyphOfStance(-2));
    expect(toneOfStance(1)).toBe(toneOfStance(2));
    expect(toneOfStance(-1)).toBe(toneOfStance(-2));
  });

  it('should keep the middle of the scale apart, with exact words', () => {
    const middle = ['mitige', 'abstention', 'partage'] as const;
    expect(middle.map((k) => STANCE_SCALE_ENTRIES[k].label)).toEqual([
      'Mitigé',
      'Abstention',
      'Partagé',
    ]);
    expect(new Set(middle.map((k) => STANCE_SCALE_ENTRIES[k].glyph)).size).toBe(3);
  });

  it('should keep every party label in line with the scale words', () => {
    for (const key of ['2', '1', '0', '-1', '-2']) {
      expect(STANCE_SCALE_ENTRIES[scaleValueOfStance(Number(key) as never)].label).toBe(
        STANCE_LABEL[key]
      );
    }
  });
});

describe('Feature: partis regroupés par réponse', () => {
  const stance = (value: number | null) => ({ stance: value as never });
  const positions = [
    { party: { name: 'Zeta' }, stance: stance(-2) },
    { party: { name: 'Alpha' }, stance: stance(2) },
    { party: { name: 'Écho' }, stance: null },
    { party: { name: 'Beta' }, stance: stance(2) },
  ];

  it('should group by answer in scale order, alphabetically, skipping empty answers', () => {
    const groups = groupByStance(positions);
    expect(groups.map((g) => g.label)).toEqual(['Pour', 'Contre', 'Pas de position claire']);
    expect(groups[0].items.map((i) => i.party.name)).toEqual(['Alpha', 'Beta']);
  });
});
