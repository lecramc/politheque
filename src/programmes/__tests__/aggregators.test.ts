import { AGGREGATOR_DOMAINS, isAggregator } from '@/src/programmes/models/aggregators';

describe('Feature: domaines agrégateurs (pistes, jamais sources)', () => {
  it('should recognise every listed aggregator, whatever the subdomain', () => {
    expect(isAggregator('https://fr.wikipedia.org/wiki/Parti')).toBe(true);
    expect(isAggregator('https://www.monvote2027.fr/x')).toBe(true);
    expect(isAggregator('https://parlons-politique.fr/')).toBe(true);
    expect(isAggregator('https://casier-politique.fr/a')).toBe(true);
    expect(isAggregator('https://www.poligraph.fr/b')).toBe(true);
  });

  it('should not flag reference sources', () => {
    expect(isAggregator('https://www.lemonde.fr/a')).toBe(false);
    expect(isAggregator('https://www.assemblee-nationale.fr/scrutin')).toBe(false);
  });

  it('should keep a closed list of registrable domains', () => {
    expect(AGGREGATOR_DOMAINS).toEqual([
      'wikipedia.org',
      'monvote2027.fr',
      'parlons-politique.fr',
      'casier-politique.fr',
      'poligraph.fr',
    ]);
  });
});
