import en from '@/locales/en/assemblee.json';
import fr from '@/locales/fr/assemblee.json';
import { createTranslator } from '@/src/assemblee/i18n/translate';

const keysOf = (node: unknown, prefix = ''): string[] =>
  node && typeof node === 'object'
    ? Object.entries(node).flatMap(([key, value]) => keysOf(value, `${prefix}${key}.`))
    : [prefix.slice(0, -1)];

describe('Feature: libellés de l’interface Assemblée', () => {
  it('should offer the same keys in French and in English', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(fr).sort());
  });

  it('should leave no empty label', () => {
    for (const tree of [fr, en]) {
      for (const key of keysOf(tree)) {
        const value = key.split('.').reduce<unknown>((node, k) => (node as never)[k], tree);
        expect(value, key).toEqual(expect.any(String));
        expect((value as string).trim(), key).not.toBe('');
      }
    }
  });

  it('should fill placeholders', () => {
    const t = createTranslator({ a: { b: 'Scrutin n° {numero} du {date}' } });
    expect(t('a.b', { numero: 580, date: '22 janvier 2025' })).toBe(
      'Scrutin n° 580 du 22 janvier 2025'
    );
  });

  it('should choose the singular form for 0 and 1, the plural otherwise (French)', () => {
    const t = createTranslator({ n: { one: '{count} voix', other: '{count} voix' } }, 'fr');
    expect(t('n', { count: 1 })).toBe('1 voix');
    const u = createTranslator({ n: { one: '{count} scrutin', other: '{count} scrutins' } }, 'fr');
    expect(u('n', { count: 0 })).toBe('0 scrutin');
    expect(u('n', { count: 2 })).toBe('2 scrutins');
  });

  it('should return the key itself when a label is missing, so the gap is visible', () => {
    expect(createTranslator({})('x.y')).toBe('x.y');
  });
});
