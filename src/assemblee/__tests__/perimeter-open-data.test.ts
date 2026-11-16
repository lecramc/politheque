import fs from 'node:fs';
import path from 'node:path';

import index from '@/src/assemblee/data/scrutins-index.json';
import { classifyScrutin, isUnclassifiedSolemn } from '@/src/assemblee/models/extraction/perimeter';
import type { RawScrutin } from '@/src/assemblee/models/extraction/raw.model';

/**
 * Contrôle du périmètre contre l'open data complet (9 793 scrutins de la 17e législature) :
 * 0 manquant, 0 intrus. Lit `.cache/assemblee/<date>/scrutins/json` (non commité : télécharger avec
 * `npm run assemblee:update`) ; sans ce dossier, le test est ignoré.
 */
const CACHE = path.resolve(__dirname, '../../../.cache/assemblee');

const latestScrutinsDir = (): string | null => {
  if (!fs.existsSync(CACHE)) return null;
  const dates = fs
    .readdirSync(CACHE)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  for (const date of dates.reverse()) {
    const dir = path.join(CACHE, date, 'scrutins/json');
    if (fs.existsSync(dir)) return dir;
  }
  return null;
};

const dir = latestScrutinsDir();
const describeWithSource = dir ? describe : describe.skip;

const readAll = (): RawScrutin[] =>
  fs
    .readdirSync(dir as string)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir as string, f), 'utf8')).scrutin);

describeWithSource('Feature: périmètre contre l’open data complet', () => {
  const all = dir ? readAll() : [];
  const published = new Set(index.scrutins.map((s) => s.numero));
  const recomputed = all.filter((raw) => classifyScrutin(raw).inclus);

  it('should recompute exactly the published list: no missing scrutin, no intruder', () => {
    const recomputedNumbers = new Set(recomputed.map((raw) => Number(raw.numero)));
    const missing = [...recomputedNumbers].filter((n) => !published.has(n));
    const intruders = [...published].filter((n) => !recomputedNumbers.has(n));
    expect({ missing, intruders }).toEqual({ missing: [], intruders: [] });
  });

  it('should recognize every solemn vote and every motion, and every title opening like a whole-text vote', () => {
    const unclassified = all
      .filter(isUnclassifiedSolemn)
      .map((raw) => `${raw.numero} : ${raw.titre}`);
    expect(unclassified).toEqual([]);
  });

  it('should classify the cases the editor named', () => {
    const category = (numero: number) =>
      classifyScrutin(all.find((raw) => Number(raw.numero) === numero) as RawScrutin).categorie;
    expect([242, 445, 438, 4241, 9759, 3597, 4453, 4595, 4695, 9097, 3891].map(category)).toEqual(
      Array(11).fill('partie-budget')
    );
    expect(category(3054)).toBe('confiance');
    expect([456, 4698, 4802].map(category)).toEqual(Array(3).fill('declaration'));
    expect(
      [2105, 6022, 3060, 2873, 2208, 6133, 4, 5, 2276, 2277, 7350, 7351].map(category)
    ).toEqual(Array(12).fill('rejet-prealable'));
    expect(category(6284)).toBe('texte');
    expect([2257, 3260, 4244, 1196, 5297, 8609, 8610, 8611, 8612].map(category)).toEqual(
      Array(9).fill('resolution')
    );
  });

  it('should leave out amendments, isolated articles, rejected rejection motions and other procedure motions', () => {
    for (const raw of all) {
      const title = raw.titre.toLowerCase();
      const included = classifyScrutin(raw).inclus;
      if (/^(l'|l’)?(sous-)?amendement|^l.article (?!unique)/.test(title)) {
        expect(included, `${raw.numero} : ${raw.titre}`).toBe(false);
      }
      if (/^(la demande|la proposition du gouvernement)/.test(title)) {
        expect(included, `${raw.numero} : ${raw.titre}`).toBe(false);
      }
      if (
        /motion de rejet/.test(title) &&
        raw.sort.code !== 'adopté' &&
        raw.typeVote.codeTypeVote !== 'MOC'
      ) {
        expect(included, `${raw.numero} : ${raw.titre}`).toBe(false);
      }
    }
  });
});
