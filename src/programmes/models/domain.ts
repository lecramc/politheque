const SECOND_LEVEL = new Set(['gouv', 'co', 'com', 'org', 'ac', 'asso']);

/** Domaine « enregistrable » : deux sous-domaines du même site ne comptent pas comme deux sources. */
export const domainOf = (url: string) => {
  try {
    const labels = new URL(url).hostname.split('.');
    const keep = labels.length > 2 && SECOND_LEVEL.has(labels[labels.length - 2]) ? 3 : 2;
    return labels.slice(-keep).join('.');
  } catch {
    return url;
  }
};
