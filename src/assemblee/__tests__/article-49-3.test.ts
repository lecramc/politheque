import {
  censureMotionsOnSameText,
  isArticle493Motion,
  needsArticle493Note,
} from '@/src/assemblee/models/article-49-3';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

const motion = (alinea: 2 | 3, extra = {}) =>
  scrutinFactory({
    numero: alinea === 3 ? 693 : 526,
    type: 'MOC',
    categorie: 'censure',
    titre: `la motion de censure déposée en application de l’article 49, alinéa ${alinea}, de la Constitution par Mme X et 90 députés.`,
    ...extra,
  });

describe('Feature: article 49, alinéa 3', () => {
  it('should recognize a censure motion filed under the third alinea from its title', () => {
    expect(isArticle493Motion(motion(3))).toBe(true);
    expect(isArticle493Motion(motion(2))).toBe(false);
    expect(isArticle493Motion(scrutinFactory({ titre: "l'ensemble ... alinéa 3." }))).toBe(false);
  });

  it('should explain the rule on a third-alinea motion and on a vote on a part of a finance bill only', () => {
    expect(needsArticle493Note(motion(3))).toBe(true);
    expect(needsArticle493Note(motion(2))).toBe(false);
    expect(needsArticle493Note(scrutinFactory({ categorie: 'partie-budget' }))).toBe(true);
    expect(needsArticle493Note(scrutinFactory({ categorie: 'texte' }))).toBe(false);
  });

  it('should link the third-alinea motions of the same official legislative file, never by date', () => {
    const budget = scrutinFactory({
      numero: 438,
      categorie: 'partie-budget',
      dossier: { uid: 'DLR1', url: 'u' },
    });
    const same = motion(3, { numero: 693, dossier: { uid: 'DLR1', url: 'u' } });
    const other = motion(3, { numero: 694, dossier: { uid: 'DLR2', url: 'u' } });
    const noFile = motion(3, { numero: 695, dossier: null });
    const secondAlinea = motion(2, { numero: 696, dossier: { uid: 'DLR1', url: 'u' } });
    expect(
      censureMotionsOnSameText(budget, [budget, same, other, noFile, secondAlinea]).map(
        (s) => s.numero
      )
    ).toEqual([693]);
    expect(
      censureMotionsOnSameText(scrutinFactory({ categorie: 'partie-budget', dossier: null }), [
        same,
      ])
    ).toEqual([]);
    expect(censureMotionsOnSameText(scrutinFactory({ categorie: 'texte' }), [same])).toEqual([]);
  });
});
