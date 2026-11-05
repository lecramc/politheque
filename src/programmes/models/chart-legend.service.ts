/**
 * Légende de la carte : les partis par ordre alphabétique du nom (accents et casse ignorés).
 * Jamais d'ordre de proximité : la légende ne doit pas devenir un second classement ; il reste
 * dans l'onglet « Proximité ».
 */
export function chartLegend<T extends { id: string; name: string }>(parties: T[]): T[] {
  return [...parties].sort(
    (a, b) =>
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }) || a.id.localeCompare(b.id)
  );
}
