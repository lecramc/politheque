import { hoverKind } from '@/src/core/web/hover-kind';

const SM = 12;

describe('Feature: forme du survol des zones cliquables', () => {
  it('should hover a bordered box by its border', () => {
    expect(hoverKind({ borderWidth: 1 }, SM)).toBe('border');
  });

  it('should hover a transparent box with enough horizontal padding as a surface', () => {
    expect(hoverKind({ paddingHorizontal: 12 }, SM)).toBe('surface');
    expect(hoverKind({ padding: 20, backgroundColor: 'transparent' }, SM)).toBe('surface');
  });

  it('should hover a box without horizontal padding as text, never with a background', () => {
    expect(hoverKind({}, SM)).toBe('text');
    expect(hoverKind({ paddingHorizontal: 4 }, SM)).toBe('text');
    expect(hoverKind({ paddingLeft: 0, paddingRight: 6 }, SM)).toBe('text');
  });

  it('should keep the existing background of an already filled box', () => {
    expect(hoverKind({ backgroundColor: '#FFFFFF' }, SM)).toBe('filled');
    expect(hoverKind({ backgroundColor: 'rgba(0,0,0,0)', paddingHorizontal: 0 }, SM)).toBe('text');
  });
});
