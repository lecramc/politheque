import { hasReachedEnd, READ_THROUGH_RATIO } from '@/src/programmes/models/reach-end.service';

describe('Feature: fin de lecture', () => {
  it('should detect the end at 85 % of the content', () => {
    expect(READ_THROUGH_RATIO).toBe(0.85);
    expect(hasReachedEnd({ offsetY: 1000, viewportHeight: 700, contentHeight: 2000 })).toBe(true);
    expect(hasReachedEnd({ offsetY: 1000, viewportHeight: 700, contentHeight: 2000 - 1 })).toBe(
      true
    );
  });

  it('should not trigger before 85 %', () => {
    expect(hasReachedEnd({ offsetY: 0, viewportHeight: 700, contentHeight: 2000 })).toBe(false);
    expect(hasReachedEnd({ offsetY: 999, viewportHeight: 700, contentHeight: 2000 })).toBe(false);
  });

  it('should consider a content that fits the viewport as read through', () => {
    expect(hasReachedEnd({ offsetY: 0, viewportHeight: 900, contentHeight: 600 })).toBe(true);
  });

  it('should not trigger on an unmeasured content', () => {
    expect(hasReachedEnd({ offsetY: 0, viewportHeight: 0, contentHeight: 0 })).toBe(false);
  });

  it('should accept a custom ratio', () => {
    expect(hasReachedEnd({ offsetY: 0, viewportHeight: 500, contentHeight: 1000 }, 0.5)).toBe(true);
  });
});
