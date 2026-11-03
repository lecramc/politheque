# Conventions du design system (`components/ui/`)

Référence figée pour garder le DS cohérent sur les **deux plateformes** (iOS SwiftUI natif
via `@expo/ui`, Android + web en React Native). À suivre pour tout nouveau composant ou prop.

## Split multi-plateforme

Metro résout les extensions de fichier par plateforme **hors du dossier `app/`** :

| Fichier                 | Cible                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| `Component.ios.tsx`     | iOS                                                                  |
| `Component.android.tsx` | Android                                                              |
| `Component.tsx`         | **fallback universel / web** (utilisé si pas de variante plateforme) |

- Le `.tsx` de base **n'est pas du code mort** : c'est le fallback web et le filet pour les
  plateformes sans variante dédiée. Ne pas le supprimer ni le renommer en `.web.tsx`.
- Deux patterns coexistent, les deux légitimes :
  - `.ios.tsx` + `.tsx` (ex. `Button`, `Picker`, `IconButton`, `DatePicker`) → iOS natif, reste en RN.
  - `.ios.tsx` + `.android.tsx` + `.tsx` (ex. `BottomSheet`, `ToggleButton`) → natif des deux côtés, `.tsx` = web.
- **Types partagés** : définir le type de props **une seule fois** (dans `index.tsx` ou le `.tsx`
  de base) et l'importer dans la variante `.ios`/`.android`. Jamais de redéfinition divergente.
- **Props no-op sur natif assumées** : certaines props RN n'ont pas d'équivalent SwiftUI
  (ex. `size` sur `ToggleButton`, `iconVariant` sur `IconButton` iOS). Elles sont acceptées pour
  la parité d'API mais ignorées côté natif — c'est intentionnel, le préfixe `_` le signale.
- **Contraintes plateforme réelles** : ne pas « aligner » de force. Ex. `DatePicker.mode` —
  Android (`AndroidMode`) ne supporte que `'date' | 'time'`, iOS (`IOSMode`) ajoute `'datetime'`.
  Le contrat commun reste `'date' | 'time'` ; l'extension iOS est documentée dans `DatePicker.ios.tsx`.

## Imports

**Toujours importer en direct par composant** — c'est la convention du projet :

```ts
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
```

Il n'y a **pas** de barrel `@/components/ui` (retiré : il entretenait deux styles d'import et
des cycles potentiels). Ne pas en recréer un partiel.

## `variant`

Deux familles, selon la nature du composant :

| Famille     | Composants                              | Valeurs                                                                                    |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Action**  | `Button`, `IconButton`, `ToggleButton`  | `primary` \| `secondary` \| `tertiary` \| `danger` (+ `brand`/`tint` internes au `Button`) |
| **Surface** | `TextInput`, `Group`, `ThemedContainer` | `primary` \| `secondary` \| `glass` \| `plain` (selon le composant)                        |

`Picker.variant = 'segmented'` désigne un **type** de picker, pas un niveau — hors familles.

## `size`

Échelle par mots : `small | medium | large` (+ `xlarge` pour les icônes : `Icon`, `IconButton`).
`Button`, `IconButton`, `ToggleButton` suivent cette échelle.

Exceptions documentées (ne pas « corriger ») :

- `TextInput` : `xs | sm | md | lg | xl` — besoin réel de 5 crans.
- `ThemedButton` (bas niveau) : objet `{ height, width }`.

## Prop d'icône

- L'icône **est** le contenu du composant → prop **`name`** (Ionicons) : `Icon`, `IconButton`.
- L'icône est un **accessoire** d'un label/champ → prop **`icon`** / **`leftIcon`** / **`rightIcon`** :
  `Button`, `TextInput`.
- **iOS natif** : la prop reçoit un nom **Ionicons**, résolu en SF Symbol via
  [`icon-symbol-map.ts`](./icon-symbol-map.ts) (source unique des équivalences). Ne jamais passer
  un SF Symbol en dur. Ajouter une entrée à la map quand un nouveau bouton en a besoin — un
  `console.warn` en dev signale une icône non mappée.
- **Portée de la map** : utilisée par les composants **labellisés** (`Button` → label + SF Symbol,
  `HeaderActions` → bar items). `IconButton` (icône-seule) reste sur l'Ionicons enveloppé dans un
  bouton **rond** centré — un SF Symbol forcé en cercle ne se centre pas proprement (padding
  intrinsèque du bouton glass). Passer `systemImage` explicitement seulement si un cas icône-seule
  natif se justifie un jour.
- Les composants **RN pur** (sans variante `.ios` SwiftUI), ex. `TextInput`/`StepLoader`, rendent
  l'Ionicons directement : pas de SF Symbol à résoudre, la map ne les concerne pas.

## Accessibilité

Tout composant tappable expose `accessibilityRole` et, si le contenu visible ne suffit pas,
`accessibilityLabel`. Pour les boutons icône-seule, fournir un `accessibilityLabel` lisible
(le nom d'icône type `chevron-back` n'est pas un libellé sémantique).

## Tokens

Jamais de couleur/spacing/borderRadius en dur — toujours `useTheme()` (`colors`, `effects`, `fonts`).
Seule exception connue : `ErrorBoundary` (composant classe qui doit s'afficher même si le rendu
themé casse) — l'exception y est commentée explicitement.
