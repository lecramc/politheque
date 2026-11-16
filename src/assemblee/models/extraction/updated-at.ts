/**
 * `updatedAt` d'un scrutin : date de la dernière extraction qui a changé son contenu. Un
 * rafraîchissement qui ne touche pas au scrutin conserve la date précédente (elle alimente le
 * `lastmod` du sitemap, jamais une date de build).
 */
export const resolveUpdatedAt = (input: {
  previous: { hash: string; updatedAt: string } | undefined;
  hash: string;
  extractedOn: string;
}): string =>
  input.previous && input.previous.hash === input.hash
    ? input.previous.updatedAt
    : input.extractedOn;
