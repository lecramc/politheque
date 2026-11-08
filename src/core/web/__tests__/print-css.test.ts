import { printCss } from '@/src/core/web/print-css';

const printBlock = printCss.slice(printCss.indexOf('@media print'));

describe('Feature: feuille CSS d’impression', () => {
  it('should hide the print-only block on screen and show it in print', () => {
    const screen = printCss.slice(0, printCss.indexOf('@media print'));
    expect(screen).toMatch(/\[data-tv~="print-only"\]\s*\{\s*display: none;/);
    expect(printBlock).toMatch(/\[data-tv~="print-only"\]\s*\{\s*display: block;/);
  });

  it('should hide whatever is marked no-print', () => {
    expect(printBlock).toMatch(/\[data-tv~="no-print"\]\s*\{\s*display: none;/);
  });

  it('should let the page flow over several sheets instead of clipping the scroll area', () => {
    expect(printBlock).toMatch(/\[data-tv~="print-flow"\]/);
    expect(printBlock).toMatch(/overflow: visible;/);
  });

  it('should drop the rail column in print', () => {
    expect(printBlock).toMatch(/\[data-tv~="rail"\]\s*\{\s*display: none;/);
  });

  it('should prefix every data-tv selector with :root and never use !important', () => {
    expect(printCss).not.toContain('!important');
    const hooks = printCss.match(/.{6}\[data-tv/g) ?? [];
    expect(hooks.length).toBeGreaterThan(5);
    for (const hook of hooks) expect(hook.startsWith(':root ')).toBe(true);
  });
});
