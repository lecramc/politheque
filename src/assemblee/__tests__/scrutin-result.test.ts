import { scrutinResultSentence } from '@/src/assemblee/models/scrutin-result';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

const synthese = (pour: number, contre: number, abstentions: number, requis: number) => ({
  votants: pour + contre + abstentions,
  exprimes: pour + contre,
  requis,
  pour,
  contre,
  abstentions,
  nonVotants: 0,
  nonVotantsVolontaires: 0,
});

describe('Feature: résultat d’un scrutin', () => {
  it('should state adopted or rejected with for, against and required majority', () => {
    expect(
      scrutinResultSentence(scrutinFactory({ adopte: true, synthese: synthese(312, 210, 14, 262) }))
    ).toBe('Adopté : 312 pour, 210 contre, 14 abstentions. Majorité requise : 262 voix.');
    expect(
      scrutinResultSentence(scrutinFactory({ adopte: false, synthese: synthese(200, 300, 0, 251) }))
    ).toBe('Rejeté : 200 pour, 300 contre, 0 abstention. Majorité requise : 251 voix.');
  });

  it('should use singular forms', () => {
    expect(
      scrutinResultSentence(scrutinFactory({ adopte: true, synthese: synthese(1, 1, 1, 1) }))
    ).toBe('Adopté : 1 pour, 1 contre, 1 abstention. Majorité requise : 1 voix.');
  });

  it('should state a censure motion result against the majority of members', () => {
    expect(
      scrutinResultSentence(
        scrutinFactory({
          type: 'MOC',
          categorie: 'censure',
          adopte: false,
          synthese: synthese(180, 0, 0, 289),
        })
      )
    ).toBe("Motion rejetée : 180 voix pour, 289 requises (majorité des membres de l'Assemblée).");
  });

  it('should word an adopted censure motion with the feminine form and a single vote', () => {
    expect(
      scrutinResultSentence(
        scrutinFactory({
          type: 'MOC',
          categorie: 'censure',
          adopte: true,
          synthese: synthese(1, 0, 0, 1),
        })
      )
    ).toBe("Motion adoptée : 1 voix pour, 1 requise (majorité des membres de l'Assemblée).");
  });

  it('should never rank, rate or comment the result', () => {
    const sentence = scrutinResultSentence(scrutinFactory());
    expect(sentence).not.toMatch(/large|serré|courte|défaite|victoire|échec|succès/i);
  });
});
