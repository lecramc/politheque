import { COPY, pluralize } from '@/src/assemblee/models/assemblee.copy';

/** Libellés visibles par le citoyen : la méthode et le référencement ont leur propre registre. */
const VISIBLE = [
  'common',
  'category',
  'categoryHelp',
  'voteType',
  'voteTypeDetail',
  'result',
  'vote',
  'list',
  'verdict',
  'scrutin',
  'details',
  'groups',
  'hemicycle',
  'legend',
  'deputies',
  'others',
  'cited',
  'source',
  'comprendre',
] as const;

const collect = (node: unknown): string[] => {
  if (typeof node === 'string') return [node];
  // Les phrases à trous sont essayées avec des nombres : seul le vocabulaire nous intéresse.
  if (typeof node === 'function') return collect((node as (...args: number[]) => unknown)(2, 2, 2));
  if (node && typeof node === 'object') return Object.values(node).flatMap(collect);
  return [];
};

/** La règle du périmètre est reprise mot pour mot, comme dans la méthode : elle garde son vocabulaire. */
const EXACT_RULE = [COPY.list.criteriaLead, COPY.list.criteriaExcluded];

const visibleTexts = () =>
  VISIBLE.flatMap((section) => collect(COPY[section])).filter((text) => !EXACT_RULE.includes(text));

/** Références admises : le numéro officiel, qui demande le scrutin, le dernier scrutin retenu. */
const ALLOWED = /scrutin n°|scrutin demandé par|dernier scrutin retenu|fichier des scrutins/gi;

const JARGON = [
  /suffrages?/i,
  /majorité requise/i,
  /non-votant/i,
  /mises? au point/i,
  /par délégation/i,
  /législature/i,
  /dossier législatif/i,
  /scrutin public/i,
  /pas de vote enregistré/i,
  /\bnon inscrits?\b/i,
  /nominativ/i,
  /\b17e\b/i,
  /\bscrutins?\b/i,
];

describe('Feature: textes de l’interface Assemblée', () => {
  it('should give the title of the page and French plurals (0 and 1 are singular)', () => {
    expect(COPY.list.title).toBe("Les votes de l'Assemblée");
    expect(COPY.list.abstentions(0)).toBe('0 abstention');
    expect(COPY.list.abstentions(1)).toBe('1 abstention');
    expect(COPY.list.abstentions(2)).toBe('2 abstentions');
    expect(pluralize(1, 'vote', 'votes')).toBe('vote');
  });

  it('should leave no jargon in the visible labels, « scrutin n° » being only a reference', () => {
    for (const text of visibleTexts()) {
      const plain = text.replace(ALLOWED, '');
      for (const term of JARGON) {
        expect(plain, `« ${text} » contient ${term}`).not.toMatch(term);
      }
    }
  });

  it('should say « vote » everywhere the citizen reads a count or a button', () => {
    expect(COPY.list.count(338, 338)).toBe('338 votes');
    expect(COPY.list.count(12, 338)).toBe('12 votes sur 338');
    expect(COPY.list.more(20)).toBe('Voir 20 votes de plus');
    expect(COPY.common.backToList).toBe('Tous les votes');
    expect(COPY.comprendre.cardMeta(338)).toBe('338 votes');
  });

  it('should explain the glossary terms in one line', () => {
    expect(COPY.details.glossaryDelegation).toBe(
      'Vote confié à un collègue : le député absent a chargé un collègue de voter pour lui.'
    );
    expect(COPY.groups.nonInscrits).toBe('Non-inscrits : députés sans groupe');
    expect(COPY.groups.note).toBe(
      "Un groupe n'est pas un parti : ses députés ne sont pas tous du même parti."
    );
    expect(COPY.details.nonVotants).toContain('par exemple la présidence de séance');
  });

  it('should give the hints under the diagram: touch on a phone, hover on a computer', () => {
    expect(COPY.hemicycle.mention).toBe(
      'Schéma simplifié : les sièges sont placés selon leur numéro officiel.'
    );
    expect(COPY.hemicycle.hintTouch).toBe('Touchez un groupe pour voir ses sièges.');
    expect(COPY.hemicycle.hintHover).toBe('Survolez un siège pour voir le député.');
  });
});
