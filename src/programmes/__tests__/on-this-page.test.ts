import { DEBATE_ANCHORS, METHODOLOGY_ANCHORS } from '@/src/programmes/models/on-this-page';

describe('Feature: sommaires « Sur cette page »', () => {
  it('should only use URL-safe anchor ids', () => {
    for (const item of [...DEBATE_ANCHORS, ...METHODOLOGY_ANCHORS]) {
      expect(item.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('should give each entry a distinct label', () => {
    for (const list of [DEBATE_ANCHORS, METHODOLOGY_ANCHORS]) {
      expect(new Set(list.map((item) => item.label)).size).toBe(list.length);
    }
  });

  it('should keep the debate summary short and lead to the comparison', () => {
    expect(DEBATE_ANCHORS.length).toBeLessThanOrEqual(5);
    expect(DEBATE_ANCHORS.some((item) => item.action === 'compare')).toBe(true);
  });
});
