import { lineHeightFor } from '@/src/programmes/models/line-height.service';

describe('Feature: interligne du texte courant', () => {
  it('should give body text (16 px) a 24 px line height', () => {
    expect(lineHeightFor(16)).toBe(24);
  });

  it('should keep small text airy but never above 1.5', () => {
    expect(lineHeightFor(14)).toBe(21);
    expect(lineHeightFor(12)).toBe(18);
  });

  it('should tighten large text so that headings do not drift apart', () => {
    expect(lineHeightFor(22)).toBe(28);
    expect(lineHeightFor(28)).toBe(35);
  });

  it('should round to a whole pixel', () => {
    expect(lineHeightFor(15)).toBe(23);
  });
});
