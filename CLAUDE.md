# Travée — Project Memory

## Règles Git

- **Ne jamais ajouter `Co-Authored-By` dans les messages de commit.**

### Convention de commits

| Type       | Pour quoi                                   |
| ---------- | ------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité visible utilisateur |
| `fix`      | Correction de bug                           |
| `build`    | Dépendances, config, scripts, CI            |
| `refactor` | Réécriture interne sans impact utilisateur  |

- `feat` et `fix` → apparaissent dans le CHANGELOG et les release notes stores
- `build` et `refactor` → ignorés dans le CHANGELOG
- Si un fix touche aussi des tests, c'est quand même un `fix`

### Versioning automatique (hook `commit-msg`)

Le hook `.husky/commit-msg` bumpe `package.json` automatiquement à chaque commit :

| Type de commit                           | Bump                      |
| ---------------------------------------- | ------------------------- |
| `fix:`                                   | patch (`x.y.z → x.y.z+1`) |
| `feat:`                                  | minor (`x.y.z → x.y+1.0`) |
| `feat!:` ou `BREAKING CHANGE:` en footer | major (`x.y.z → x+1.0.0`) |
| `build:` / `refactor:` / autres          | aucun                     |

- `app.config.ts` lit la version depuis `package.json` — un seul endroit à modifier.
- Le bump est inclus dans le commit, pas besoin de le faire manuellement.

> **Règle branche feature** : sur une branche de feature, utiliser `build:` pour les corrections intermédiaires (typos, types, layout) — pas `fix:`. Réserver `fix:` aux vrais bugs qui méritent d'apparaître dans le CHANGELOG.

---

## Produit

**Travée** : site web neutre et non partisan pour comprendre la politique française —
institutions (guide « Comprendre »), partis (histoire, idées, positions), élections (la
présidentielle 2027 est à la une), grands débats, et questionnaire de positionnement.
Architecture de l'information : `docs/architecture-information.md`.

**Règle n° 1 : aucune affirmation sans source datée.** Lire `docs/charte-editoriale.md` avant
de toucher aux données. Format d'une fiche parti : `docs/brief-recherche-parti.md`.
Les tests `src/programmes/__tests__/data-integrity.test.ts` font respecter la charte.

- Données : `src/programmes/data/` (JSON + `questions.ts`), chargées via `StaticProgrammeGateway`.
- Calcul : `src/programmes/models/matching.service.ts` (pur, testé).
- Pas de backend : site statique (`npm run build:web` → `dist/`), aucune réponse n'est envoyée.

---

## Agents et modèles

- **Build / implémentation → Sonnet** : `tdd`, `ui-designer`, `motion-designer`, et tout agent qui écrit ou corrige du code.
- **Réflexion → Opus** : `architect`, `reviewer`, `evaluator`, recherche, fact-checking, méthodologie, revues.
- Lors d'une délégation ponctuelle, préciser le modèle selon cette règle.

---

## Stack technique

- **Framework** : Expo SDK 56, CNG — `android/` et `ios/` sont générés par `expo prebuild`, non commités
- **Navigation** : Expo Router v4 (file-based)
- **State** : Redux Toolkit
- **Backend** : aucun (export web statique)
- **Tests** : Vitest (`npm run test:run`)
- **Builds** : EAS Build / `eas workflow:run build-prod.yml`
- **Langues** : Français, Anglais (`i18n/`, `locales/`)

---

## Moments émotionnels — Emotional Theme

Certains écrans sont des **moments émotionnels** : pics brand visuellement immersifs, toujours sombres, indépendants du mode système (light/dark).

**Règle :** Ne jamais utiliser `useTheme()` dans ces écrans — utiliser `useEmotionalTheme()` depuis `components/EmotionalTheme.ts`.

```typescript
import { useEmotionalTheme } from '@/components/EmotionalTheme';
const { colors, effects, fonts } = useEmotionalTheme();
```

**Tokens disponibles :**

```
colors.background.default / primary / clear
colors.text.primary / secondary / disabled / onColor / skip
colors.surface.border.primary
colors.surface.skip.bg
colors.surface.dot.inactive
colors.tint / tintSoft / tintBorder
colors.ctaGradient        // [string, string] — gradient bouton CTA brand
colors.heroGradient       // [string, string, string, string] — gradient fond hero
```

---

## Règle fondamentale — Toujours préférer l'existant

Avant de créer quoi que ce soit, chercher dans le projet :

1. **Composants UI** → regarder `components/ui/` en premier
2. **Thème** → utiliser `useTheme()` depuis `components/ThemeContext.tsx` (écrans normaux) ou `useEmotionalTheme()` (moments émotionnels)
3. **Navigation** → utiliser les routes `app/` existantes
4. **Icônes** → `Ionicons` via le composant `Icon` de `components/ui/Icon`
5. **Animations** → durées et courbes dans `components/motion.ts` (`useMotion()`, mouvement réduit respecté), `react-native-reanimated` ; agent dédié : `.claude/agents/motion-designer.md`
6. **Librairies** → vérifier `package.json` avant d'en ajouter une nouvelle

Ne jamais installer une nouvelle librairie si une fonctionnalité équivalente existe déjà dans le projet ou dans les dépendances installées.

---

## Composants UI disponibles — `components/ui/`

Toujours utiliser ces composants avant d'en créer de nouveaux.

> **Conventions DS** (split iOS/Android, `variant`/`size`, prop d'icône, imports directs,
> map Ionicons→SF Symbol) : voir [`components/ui/CONVENTIONS.md`](components/ui/CONVENTIONS.md).

| Composant         | Usage                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `Button`          | CTA labelisé. iOS : SwiftUI natif. Variantes : `primary`, `secondary`, `tertiary`, `danger` |
| `ThemedButton`    | TouchableOpacity bas niveau quand Button ne suffit pas (icon + label, layout custom)        |
| `Pressable`       | Zone tappable sans style — rows, cards, chips. Feedback opacity 0.7                         |
| `IconButton`      | Bouton icône seul. iOS : SwiftUI natif avec SF Symbols via `systemImage`                    |
| `Icon`            | Icône Ionicons themée. Sizes : `small`, `medium`, `large`, `xlarge`                         |
| `TextInput`       | Input texte. Variants : `primary`, `surface`, `glass`, `plain`. Sizes : `xs` à `xl`         |
| `DatePicker`      | Sélecteur de date. iOS : modal FormSheet. Android : défaut système                          |
| `DateInput`       | Row cliquable ouvrant un DatePicker. Prop `grouped` pour usage dans Group                   |
| `TimeInput`       | Row cliquable ouvrant un TimePicker. Prop `grouped` pour usage dans Group                   |
| `Group`           | Conteneur de rows avec séparateurs automatiques — style iOS Settings                        |
| `Picker`          | Segmented control. iOS : SwiftUI natif. Android : animé Reanimated                          |
| `ToggleButton`    | Switch on/off. iOS : SwiftUI natif                                                          |
| `BottomSheet`     | Sheet modale. iOS : SwiftUI. Android : Jetpack Compose                                      |
| `ProgressBar`     | Barre de progression animée                                                                 |
| `StepLoader`      | Loader multi-étapes avec steps textuels                                                     |
| `ThemedContainer` | Container avec fond themé. Variants : `primary`, `secondary`, `glass`                       |

### Composants partagés — `components/`

| Composant       | Usage                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| `Text`          | Text themé avec variants : `body`, `title`, `subtitle`, `caption`, `quote` |
| `View`          | View de base                                                               |
| `ErrorBoundary` | Wrapping d'erreurs React                                                   |
| `ThemeContext`  | Provider + `useTheme()` hook                                               |

### Hooks core — `src/core/hooks/`

| Hook                   | Usage                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useActiveFocusEffect` | Déclenche un effet lors du focus navigation **et** du retour au premier plan (`AppState → 'active'`). Remplace le pattern `useFocusEffect` + `useEffect(AppState)` inline. Wrapper le callback dans `useCallback`. |
| `useViewModel`         | Connecte un écran à son view-model Redux.                                                                                                                                                                          |

---

## Système de thème — `components/ThemeContext.tsx`

**Toujours** utiliser `useTheme()`. Ne jamais hardcoder des couleurs ou des tailles.

```typescript
const { colors, effects, fonts, theme } = useTheme();
```

### `colors` — palette light/dark automatique

```
colors.background.default / primary / secondary / tertiary / player
colors.surface.primary / secondary / tertiary / glass / disabled
colors.surface.border.primary / secondary / tertiary / glass
colors.surface.border.hover.primary / secondary / tertiary
colors.text.primary / secondary / strong / disabled / onColor
colors.text.glass / glassSecondary
colors.tint / tintSoft / tintBorder
colors.ctaGradient           // [string, string] — gradient CTA brand
colors.tabIconDefault / tabIconSelected / tabIndicator
colors.accent.success / warning / error / info
colors.shadow.color / elevation
```

### `colors` — palette unique (suit l'OS)

**L'app suit l'apparence de l'OS uniquement** — il n'y a pas de toggle de thème in-app.
`ThemeProviderCustom` dérive le thème de `useColorScheme()` ; clair/sombre suit donc le réglage système.

**Conséquence :** utiliser **`colors`** partout. `systemColors` est un alias strict de `colors` (vestige — nouveau code : utiliser `colors`).

### `effects` — espacements, rayons, tailles

```
effects.blur                   // 25
effects.opacity.disabled (0.5) / pressed (0.7)
effects.borderRadius.xs (8) / small (16) / medium (20) / large (28) / round (100)
effects.borderRadius.input (16) / inputGrouped (10)
effects.spacing.none/xxs/xs/sm/smd/md/lg/xl/xxl   // 0/3/6/12/16/20/28/36/48
effects.shadow.sm / md / lg    // { shadowOffset, shadowRadius, shadowOpacity }
effects.sizes.icon.small/medium/large/xlarge   // 18/22/28/36
effects.sizes.button.small/medium/large/full/fit // 40/48/54/100%
effects.sizes.text.micro/tiny/paragraph/title/subtitle/caption/body/quote/label/secondary/display/hero
effects.sizes.input.sm/md/lg   // 40/48/54
effects.sizes.row.sm/md/lg     // 44/54/64
```

### `fonts` — poids typographiques

```
fonts.regular / medium / semibold / bold / light / thin / heavy
```

---

## Architecture Clean

### Structure d'un domaine

```
src/<domain>/
  __tests__/      tests de comportement
  gateways/       interface + fake + implémentation
  models/         types, domain model, factory
  screens/        composants écran (thin layer)
  store/          slice, selector, state-builder
  usecases/       createAppAsyncThunk
  view-models/    createSelector + actions
  listeners/      side effects
  components/     composants UI propres au domaine
```

### Règles de dépendance

- Usecases → uniquement via gateways (`extra` Redux Toolkit)
- View-models → uniquement selectors + usecases
- Screens → uniquement via `useViewModel()`
- Jamais de logique métier dans les composants

### Pattern gateway

1. `<n>.gateway.ts` — interface TypeScript
2. `fake-<n>.gateway.ts` — in-memory pour les tests
3. `supabase-<n>.gateway.ts` (ou `native-`, `expo-`) — implémentation réelle

### Routing Expo Router

- `app/` = re-exports uniquement : `export { default } from '@/src/...'`
- Screens réels dans `src/<domain>/screens/`

---

## Conventions de code

- **Dates** : toujours ISO 8601 (`new Date().toISOString()`)
- **Imports** : toujours absolus via `@/`
- **Calculs** : dans `models/` (fonctions pures testées), jamais dans les composants
- **TypeScript** : strict, pas de `any` non justifié
- **i18n** : toutes les chaînes UI dans `locales/fr/` et `locales/en/`

---

## Tests

Format obligatoire :

```typescript
describe('Feature: <nom>', () => {
  it('should <comportement>', async () => {
    // Arrange / Act / Assert
  });
});
```

Toujours utiliser :

- `createTestStore({ dependencies: { myGateway: new FakeMyGateway() } })`
- `stateBuilder()` pour l'état initial
- Les fake gateways pour les dépendances externes
