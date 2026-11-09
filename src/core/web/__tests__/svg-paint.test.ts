import { paint } from '@/src/core/web/svg-paint';

describe('Feature: couleurs des SVG', () => {
  it('should keep plain presentation attributes outside the web', () => {
    expect(paint({ fill: '#1E3F8F', stroke: '#7C8394' })).toEqual({
      fill: '#1E3F8F',
      stroke: '#7C8394',
    });
  });
});
