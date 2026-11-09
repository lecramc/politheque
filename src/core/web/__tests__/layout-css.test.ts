import { layout } from '@/components/layout';
import { colorSchemeCss, layoutCss } from '@/src/core/web/layout-css';

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
      expect(/^:root \[(data-tv~="|role="heading"|dir="auto")/.test(line.trim())).toBe(true);
    }
  });

  it('should never use !important', () => {
    expect(layoutCss).not.toContain('!important');
  });

  it('should only target data-tv hooks, plus the typographic selectors listed here', () => {
    const typographic = [':root [role="heading"]', ':root [dir="auto"]'];
    const selectors = layoutCss.match(/:root [^{,]+/g) ?? [];
    for (const selector of selectors) {
      const trimmed = selector.trim();
      if (typographic.includes(trimmed)) continue;
      expect(trimmed).toMatch(/^:root \[data-tv~="[a-z0-9-]+"\](:hover|:focus-visible)?$/);
    }
  });

  it('should balance headings and keep paragraphs free of orphan words', () => {
    expect(layoutCss).toMatch(/:root \[role="heading"\]\s*{[^}]*text-wrap: balance;/);
    expect(layoutCss).toMatch(/:root \[dir="auto"\]\s*{[^}]*text-wrap: pretty;/);
  });

  it('should give text links a hover, a focus ring in the text colour and a taller hit area', () => {
    expect(layoutCss).toMatch(
      /\[data-tv~="text-link"\]:hover\s*{[^}]*text-decoration-thickness: 2px;/
    );
    expect(layoutCss).toMatch(
      /\[data-tv~="text-link"\]:focus-visible\s*{[^}]*outline: 2px solid currentColor;/
    );
    expect(layoutCss).toMatch(/\[data-tv~="text-link"\]\s*{[^}]*padding-block: 3px;/);
  });

  it('should use the same rail widths as the tokens', () => {
    expect(layoutCss).toContain(`${layout.rail.lg}px minmax(0, ${layout.main.xl}px)`);
    expect(layoutCss).toContain(`${layout.rail.xl}px minmax(0, ${layout.main.xl}px)`);
  });

  it('should fill the 1120px container exactly with rail, gutter and column from 1200px', () => {
    expect(layout.rail.xl + layout.railGap.xl + layout.main.xl).toBe(layout.container);
  });

  it('should centre single columns and give them an explicit width', () => {
    expect(layoutCss).toMatch(
      /\[data-tv~="solo"\],\s*:root \[data-tv~="list-col"\]\s*{[^}]*width: 100%;[^}]*margin-left: auto;[^}]*margin-right: auto;/
    );
  });

  it('should fix the stance cell width at 152px from 768px', () => {
    expect(layoutCss).toContain(`width: ${layout.stanceCell.md}px;`);
  });

  it('should hide the bottom bar from 768px', () => {
    const md = layoutCss.split(`@media (min-width: ${layout.breakpoint.lg}px)`)[0];
    expect(md).toMatch(/\[data-tv~="bottom-bar"\][^}]*display: none;/);
  });
});

describe("Feature: fond du document avant l'hydratation", () => {
  it('should paint the document background in dark mode while the static light page is shown', () => {
    const css = colorSchemeCss('#0E1424');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toMatch(/html,\s*body\s*{[^}]*background-color: #0E1424;/);
  });
});
