import { domainOf } from '@/src/programmes/models/verification.service';

/**
 * Liste fermée des agrégateurs et encyclopédies collaboratives : des pistes pour trouver une
 * source, jamais des sources (charte, règle 7). Domaines enregistrables, sous-domaines compris.
 */
export const AGGREGATOR_DOMAINS: readonly string[] = [
  'wikipedia.org',
  'monvote2027.fr',
  'parlons-politique.fr',
  'casier-politique.fr',
  'poligraph.fr',
];

export const isAggregator = (url: string) => AGGREGATOR_DOMAINS.includes(domainOf(url));
