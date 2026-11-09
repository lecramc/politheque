import {
  guardThemeSwitch,
  THEME_SWITCH_ATTRIBUTE,
  themeSwitchCss,
} from '@/src/core/web/theme-switch';

const fakeWindow = () => {
  const listeners: (() => void)[] = [];
  const frames: (() => void)[] = [];
  const attributes = new Map<string, string>();
  const win = {
    matchMedia: () => ({
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: () => void) =>
        listeners.splice(listeners.indexOf(cb), 1),
    }),
    requestAnimationFrame: (cb: () => void) => frames.push(cb),
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => attributes.set(name, value),
        removeAttribute: (name: string) => attributes.delete(name),
      },
    },
  };
  const nextFrame = () => frames.splice(0).forEach((cb) => cb());
  return { win: win as never, listeners, attributes, nextFrame };
};

describe('Feature: changement de thème sans transition de couleur', () => {
  it('should mark the document while the system theme switches, for two frames', () => {
    const { win, listeners, attributes, nextFrame } = fakeWindow();
    guardThemeSwitch(win);

    listeners.forEach((cb) => cb());
    expect(attributes.has(THEME_SWITCH_ATTRIBUTE)).toBe(true);
    nextFrame();
    expect(attributes.has(THEME_SWITCH_ATTRIBUTE)).toBe(true);
    nextFrame();
    expect(attributes.has(THEME_SWITCH_ATTRIBUTE)).toBe(false);
  });

  it('should stop listening once disposed', () => {
    const { win, listeners } = fakeWindow();
    const dispose = guardThemeSwitch(win);
    dispose();
    expect(listeners).toHaveLength(0);
  });

  it('should disable every transition while the attribute is set', () => {
    expect(themeSwitchCss).toMatch(/^:root\[data-theme-switching\] \*,/);
    expect(themeSwitchCss).toContain('{transition:none!important}');
  });
});
