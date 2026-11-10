import en from '@/locales/en/assemblee.json';
import fr from '@/locales/fr/assemblee.json';

type Tree = { [key: string]: string | Tree };
type Vars = Record<string, string | number>;

/**
 * Traducteur du domaine : clés pointées, `{variable}` et pluriels `{ one, other }` (0 et 1 au
 * singulier en français). Une clé absente renvoie la clé : le trou se voit, la page ne casse pas.
 */
export const createTranslator =
  (tree: Tree, locale: 'fr' | 'en' = 'fr') =>
  (key: string, vars: Vars = {}): string => {
    let node: string | Tree | undefined = tree;
    for (const part of key.split('.')) {
      node = typeof node === 'object' ? node[part] : undefined;
    }
    if (node === undefined) return key;
    if (typeof node === 'object') {
      const count = Number(vars.count);
      const singular = locale === 'fr' ? count <= 1 : count === 1;
      const form = singular ? node.one : node.other;
      node = typeof form === 'string' ? form : undefined;
      if (node === undefined) return key;
    }
    return node.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
  };

/**
 * Le site est publié en français uniquement (`<html lang="fr">`) : la langue ne dépend jamais de
 * l'appareil, ce qui garde le HTML statique et le premier rendu client identiques. Le fichier
 * anglais suit les mêmes clés (test de parité) et sert dès qu'une version anglaise sera ouverte.
 */
export const t = createTranslator(fr as Tree, 'fr');
export const tEn = createTranslator(en as Tree, 'en');
