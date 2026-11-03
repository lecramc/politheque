Valide le code produit par /build. Corrige ce qui est auto-fixable. Flag le reste. Donne un score.

## Lecture obligatoire

1. `CLAUDE.md` — règles du projet
2. `.claude/blueprint.md` — vérifier que l'implémentation correspond au plan
3. `git diff HEAD --stat` puis le contenu complet de chaque fichier `.ts` / `.tsx` modifié
4. `git log --oneline -5`

---

## Checklist

### Architecture Clean

- [ ] Aucune logique métier dans les screens ou composants UI
- [ ] Les screens utilisent uniquement `useViewModel()`
- [ ] Les usecases passent exclusivement par les gateways (via `extra`)
- [ ] Les view-models utilisent `createSelector`
- [ ] Toute dépendance externe a une interface gateway + une fake

### Patterns obligatoires

- [ ] Usecases : `tryCatch` + `isFailure` / `rejectWithValue`
- [ ] Slice : `pending` / `fulfilled` / `rejected` tous traités dans `extraReducers`
- [ ] Selectors dans `<domain>.selector.ts`, pas inline
- [ ] Imports absolus via `@/`, jamais de `../../`
- [ ] Fichiers `app/` = re-export uniquement

### Tests

- [ ] Tests présents pour chaque usecase ajouté ou modifié
- [ ] Tests présents pour chaque view-model ajouté ou modifié
- [ ] Format `describe('Feature: ...') > it('should ...')` respecté
- [ ] `createTestStore` avec bonnes dépendances injectées
- [ ] State-builder utilisé
- [ ] Cas d'erreur testés (gateway throws, NO_USER, rejected)
- [ ] `npm run test:run` passe sans erreur

### Conventions TypeScript

- [ ] Pas de `any` non justifié
- [ ] Types dans `<domain>-domain.model.ts` (namespace pattern)
- [ ] Factory dans `<domain>-domain.factory.ts`

### Conventions projet

- [ ] Dates ISO 8601, jamais de format local dans les modèles
- [ ] Aucun calcul de stats côté Redux client
- [ ] Gestion d'erreur sur chaque appel async
- [ ] Aucune valeur de couleur, spacing ou borderRadius hardcodée dans les composants

### Régressions connues

- [ ] Date picker : fuseau horaire non affecté
- [ ] Navigation : lien retour sur chaque écran modifié

### Conformité blueprint

- [ ] Tous les fichiers listés dans "Fichiers impactés" ont été créés/modifiés
- [ ] Tous les comportements de la section 9 sont couverts par des tests
- [ ] Aucune décision d'architecture prise hors blueprint

---

## Auto-fix — corriger directement (sans demander)

- Imports relatifs `../../` → imports absolus `@/`
- Imports inutilisés → supprimer
- `useCallback` sans raison valable → supprimer
- Couleur / spacing hardcodé trivial → token `useTheme()`
- `Co-Authored-By` dans message de commit → supprimer

---

## Handoff — déléguer plutôt que signaler

Quand un problème est trop complexe pour un auto-fix mais clairement identifié, **ne pas juste le signaler : le déléguer activement** en invoquant le bon skill :

| Situation                                                    | Action                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Bug ou régression à corriger, implémentation à compléter     | Invoquer `/build` avec un brief précis (fichier:ligne, comportement attendu, comportement actuel) |
| Violation d'architecture, mauvaise couche, décision à revoir | Invoquer `/archi` avec le contexte du problème et la contrainte violée                            |
| Composant UI incorrect, tokens manquants, layout à revoir    | Invoquer `/design` avec la description du problème visuel et les fichiers concernés               |

**Règle** : un problème bloquant dans "Requiert attention humaine" doit toujours être accompagné d'un handoff vers le bon skill — ou d'une question explicite à l'utilisateur si le choix du skill est ambigu.

---

## Output — format strict

```
## Code Review

### Corrigé (auto-fix)
- [fichier:ligne] → changement effectué
(ou "Rien à corriger automatiquement")

### Avertissements (non bloquants)
| Fichier | Ligne | Problème | Suggestion |
|---------|-------|---------|------------|

### Requiert attention humaine (bloquant)
| Fichier | Ligne | Règle violée | Handoff |
|---------|-------|-------------|---------|
| src/... | 42 | [problème] | → /build : [brief précis] |
| src/... | 17 | [problème] | → /archi : [brief précis] |

### Tests
[Résultat npm run test:run]
[Résultat npm run test:integration si gateways Supabase modifiées]

### TypeScript
[Résultat npx tsc --noEmit]

### Score: X/10
[Justification en 1-2 phrases]
```

**Score ≥ 8/10** → "Prêt à commit." — ou lancer les handoffs si des bloquants ont été identifiés.
**Score < 8/10** → Invoquer immédiatement le(s) skill(s) approprié(s) pour corriger avant de conclure.
