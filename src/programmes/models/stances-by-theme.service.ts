interface ThemeLike {
  id: string;
  title: string;
}

interface ItemLike {
  question: { theme: string };
}

export interface ThemeGroup<T extends ItemLike, H extends ThemeLike = ThemeLike> {
  theme: H;
  items: T[];
}

/**
 * Regroupe les positions par thème, dans l'ordre de la liste des thèmes (le même pour tous les
 * partis : neutre). L'ordre des questions est conservé dans chaque thème ; un thème sans question
 * est omis. Une question d'un thème inconnu n'est jamais perdue : elle forme un groupe final.
 */
export function stancesByTheme<T extends ItemLike, H extends ThemeLike>(
  items: T[],
  themes: H[]
): ThemeGroup<T, H>[] {
  const known = new Set(themes.map((t) => t.id));
  const groups: ThemeGroup<T, H>[] = themes
    .map((theme) => ({ theme, items: items.filter((i) => i.question.theme === theme.id) }))
    .filter((g) => g.items.length > 0);
  const orphans = items.filter((i) => !known.has(i.question.theme));
  if (orphans.length > 0) {
    groups.push({ theme: { id: 'autres', title: 'Autres' } as unknown as H, items: orphans });
  }
  return groups;
}
