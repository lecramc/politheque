import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..', '..', '..');
const html = readFileSync(join(ROOT, 'app', '+html.tsx'), 'utf8');
const files = [...html.matchAll(/file: '([^']+\.woff2)'/g)].map((m) => m[1]);

describe('Feature: polices web en WOFF2', () => {
  it('should declare the five families used by the theme', () => {
    expect(files).toHaveLength(5);
  });

  it('should ship every declared file, named after its own hash', () => {
    for (const file of files) {
      const path = join(ROOT, 'public', 'assets', 'fonts', file);
      expect(existsSync(path), file).toBe(true);
      const hash = createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 10);
      expect(file, 'empreinte du nom').toContain(`.${hash}.woff2`);
    }
  });

  it('should no longer reference TrueType on the web', () => {
    expect(html).not.toMatch(/truetype|font\/ttf/);
  });
});
