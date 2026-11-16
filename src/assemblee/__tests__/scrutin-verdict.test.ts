import { scrutinVerdict } from '@/src/assemblee/models/scrutin-verdict';
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

describe('Feature: verdict d’un vote', () => {
  it('should say rejected in one word, then the counts, then what was needed', () => {
    const verdict = scrutinVerdict(
      scrutinFactory({ adopte: false, synthese: synthese(0, 458, 2, 230) })
    );
    expect(verdict).toMatchObject({
      kind: 'standard',
      adopte: false,
      headline: 'Rejeté',
      counts: '0 pour · 458 contre · 2 abstentions',
      threshold: "Il fallait 230 voix pour l'adopter.",
    });
  });

  it('should say adopted with the same template', () => {
    const verdict = scrutinVerdict(
      scrutinFactory({ adopte: true, synthese: synthese(152, 5, 110, 79) })
    );
    expect(verdict).toMatchObject({
      headline: 'Adopté',
      counts: '152 pour · 5 contre · 110 abstentions',
      threshold: "Il fallait 79 voix pour l'adopter.",
    });
  });

  it('should draw one bar with for, against and abstentions, and a mark at the threshold', () => {
    const verdict = scrutinVerdict(
      scrutinFactory({ adopte: true, synthese: synthese(217, 213, 3, 216) })
    );
    if (verdict.kind !== 'standard') throw new Error('verdict standard attendu');
    expect(verdict.bar).toEqual({
      segments: [
        { kind: 'pour', count: 217 },
        { kind: 'contre', count: 213 },
        { kind: 'abstention', count: 3 },
      ],
      total: 433,
      threshold: 216,
    });
  });

  it('should leave empty positions out of the bar', () => {
    const verdict = scrutinVerdict(
      scrutinFactory({ adopte: false, synthese: synthese(0, 458, 0, 230) })
    );
    if (verdict.kind !== 'standard') throw new Error('verdict standard attendu');
    expect(verdict.bar.segments).toEqual([{ kind: 'contre', count: 458 }]);
  });

  it('should say what a censure motion decided: the Government stays or is overthrown', () => {
    const rejected = scrutinVerdict(
      scrutinFactory({ type: 'MOC', adopte: false, synthese: synthese(132, 0, 0, 289) })
    );
    expect(rejected).toMatchObject({
      kind: 'censure',
      adopte: false,
      headline: 'Motion rejetée : le Gouvernement reste en place.',
      detail:
        "132 députés l'ont votée. Il en fallait 289 (la majorité des membres de l'Assemblée) pour renverser le Gouvernement.",
      note: "Seuls les votes « pour » sont comptés. Ne pas voter la motion n'est pas voter contre.",
    });
    expect(
      scrutinVerdict(
        scrutinFactory({ type: 'MOC', adopte: true, synthese: synthese(300, 0, 0, 289) })
      ).headline
    ).toBe('Motion adoptée : le Gouvernement est renversé.');
  });

  it('should use the singular for a single vote', () => {
    const verdict = scrutinVerdict(
      scrutinFactory({ type: 'MOC', adopte: false, synthese: synthese(1, 0, 0, 289) })
    );
    expect(verdict).toMatchObject({
      detail: expect.stringContaining("1 député l'a votée."),
    });
  });

  it('should never rank, rate or comment the result', () => {
    const verdict = scrutinVerdict(scrutinFactory({ synthese: synthese(217, 213, 3, 216) }));
    const text = JSON.stringify(verdict);
    expect(text).not.toMatch(/large|serré|courte|défaite|victoire|échec|succès|écart/i);
  });
});
