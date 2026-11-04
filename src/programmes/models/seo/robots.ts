import { SITE_URL } from '@/src/core/config/app';

export const SEARCH_AND_ANSWER_BOTS = [
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Claude-SearchBot',
  'Claude-User',
] as const;

export const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'meta-externalagent',
] as const;

const group = (bots: readonly string[], rule: string) =>
  `${bots.map((b) => `User-agent: ${b}`).join('\n')}\n${rule}\n`;

/**
 * Un robot qui a son propre groupe ignore le groupe « * » : chaque groupe est donc complet.
 * Aucune page noindex n'est bloquée (sinon le noindex ne serait jamais vu).
 */
export function buildRobotsTxt({ allowTraining }: { allowTraining: boolean }): string {
  return [
    group(SEARCH_AND_ANSWER_BOTS, 'Allow: /'),
    ...(allowTraining ? [] : [group(AI_TRAINING_BOTS, 'Disallow: /')]),
    group(['*'], 'Allow: /'),
    `Sitemap: ${SITE_URL}/sitemap.xml\n`,
  ].join('\n');
}
