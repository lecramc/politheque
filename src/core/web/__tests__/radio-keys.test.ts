import { radioKeyAction } from '@/src/core/web/radio-keys';

describe("Feature: clavier d'un groupe de boutons radio", () => {
  it('should choose the focused option with Space', () => {
    expect(radioKeyAction(' ', 2, 6)).toEqual({ type: 'choose' });
  });

  it('should move the focus to the next option with ArrowDown or ArrowRight', () => {
    expect(radioKeyAction('ArrowDown', 1, 6)).toEqual({ type: 'focus', index: 2 });
    expect(radioKeyAction('ArrowRight', 1, 6)).toEqual({ type: 'focus', index: 2 });
  });

  it('should move the focus to the previous option with ArrowUp or ArrowLeft', () => {
    expect(radioKeyAction('ArrowUp', 3, 6)).toEqual({ type: 'focus', index: 2 });
    expect(radioKeyAction('ArrowLeft', 3, 6)).toEqual({ type: 'focus', index: 2 });
  });

  it('should wrap around at both ends of the group', () => {
    expect(radioKeyAction('ArrowDown', 5, 6)).toEqual({ type: 'focus', index: 0 });
    expect(radioKeyAction('ArrowUp', 0, 6)).toEqual({ type: 'focus', index: 5 });
  });

  it('should leave every other key alone (Enter, Tab are handled by the browser)', () => {
    expect(radioKeyAction('Enter', 0, 6)).toBeNull();
    expect(radioKeyAction('Tab', 0, 6)).toBeNull();
  });
});
