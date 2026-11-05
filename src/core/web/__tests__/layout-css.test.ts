import { layout } from '@/components/layout';
import { layoutCss } from '@/src/core/web/layout-css';

describe('Feature: feuille CSS responsive', () => {
  it('should declare the three breakpoints of the layout tokens', () => {
    for (const width of Object.values(layout.breakpoint)) {
      expect(layoutCss).toContain(`@media (min-width: ${width}px)`);
    }
    expect([768, 1024, 1200]).toEqual(Object.values(layout.breakpoint));
  });

  it('should prefix every selector with :root to win over react-native-web classes', () => {
    const selectorLines = layoutCss
      .split('\n')
      .filter((line) => /[{,]$/.test(line.trim()) && !line.trim().startsWith('@media'));
    expect(selectorLines.length).toBeGreaterThan(10);
    for (const line of selectorLines) {
      expect(line.trim().startsWith(':root [data-tv~="')).toBe(true);
    }
  });

  it('should never use !important', () => {
    expect(layoutCss).not.toContain('!important');
  });

  it('should only target data-tv hooks, never an element or a class', () => {
    const selectors = layoutCss.match(/:root [^{,]+/g) ?? [];
    for (const selector of selectors) {
      expect(selector.trim()).toMatch(/^:root \[data-tv~="[a-z0-9-]+"\]$/);
    }
  });

  it('should use the same rail widths as the tokens', () => {
    expect(layoutCss).toContain(`${layout.rail.lg}px minmax(0, 1fr)`);
    expect(layoutCss).toContain(`${layout.rail.xl}px minmax(0, ${layout.main.xl}px)`);
  });

  it('should fix the stance cell width at 152px from 768px', () => {
    expect(layoutCss).toContain(`width: ${layout.stanceCell.md}px;`);
  });

  it('should hide the bottom bar from 768px', () => {
    const md = layoutCss.split(`@media (min-width: ${layout.breakpoint.lg}px)`)[0];
    expect(md).toMatch(/\[data-tv~="bottom-bar"\][^}]*display: none;/);
  });
});
