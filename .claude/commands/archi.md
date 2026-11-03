Conçois le blueprint complet de la feature. Aucun code — uniquement des décisions.
Écris le résultat dans `.claude/blueprint.md`.

## Lecture obligatoire avant de commencer

1. `CLAUDE.md` — règles, architecture Clean, patterns obligatoires
2. `.claude/design-spec.md` — **si présent, lire en entier. C'est l'autorité pour l'UI.**
3. Le domaine existant concerné — `src/<domain>/` (structure, gateways, models, store)
4. `src/core/store/` — create-store, create-test-store, app-async-thunk

---

## Contraintes non-négociables

- **Clean Architecture** : gateway → usecase → view-model → screen. Aucun raccourci.
- **Jamais de logique métier dans les screens ou composants**
- **Toute dépendance externe** (Supabase, caméra, keychain, notifications) passe par une interface gateway + fake
- **Stats et streaks** : calcul côté Supabase uniquement, jamais Redux client
- **Dates** : ISO 8601 dans tous les contrats
- **Un seul view-model par écran** — fusionner si écran existant

---

## Output — écrire `.claude/blueprint.md`

```markdown
## Blueprint — [Nom de la feature]

### 1. Résumé

[Une phrase : ce que la feature fait, pour qui, pourquoi.]

### 2. Fichiers impactés

| Fichier                      | Action         | Description          |
| ---------------------------- | -------------- | -------------------- |
| src/<domain>/models/...      | créer/modifier |                      |
| src/<domain>/gateways/...    | créer/modifier |                      |
| src/<domain>/store/...       | créer/modifier |                      |
| src/<domain>/usecases/...    | créer/modifier |                      |
| src/<domain>/view-models/... | créer/modifier |                      |
| src/<domain>/screens/...     | créer/modifier |                      |
| src/<domain>/**tests**/...   | créer/modifier |                      |
| app/...                      | créer/modifier | re-export uniquement |

### 3. Domain model

Types TypeScript complets (namespace pattern) :
\`\`\`typescript
// src/<domain>/models/<domain>-domain.model.ts
export namespace MyDomainModel {
export interface Entity { ... }
export type Status = 'idle' | 'loading' | 'fulfilled' | 'rejected';
}
\`\`\`

Factory pour les tests :
\`\`\`typescript
// src/<domain>/models/<domain>-domain.factory.ts
export class MyDomainFactory {
static create(data?: Partial<MyDomainModel.Entity>): MyDomainModel.Entity { ... }
}
\`\`\`

### 4. Gateway

Interface :
\`\`\`typescript
// src/<domain>/gateways/<name>.gateway.ts
export interface MyGateway {
doSomething(params: Params): Promise<Result>;
}
\`\`\`

Fake (in-memory, pour les tests) :
\`\`\`typescript
// src/<domain>/gateways/fake-<name>.gateway.ts
export class FakeMyGateway implements MyGateway { ... }
\`\`\`

Supabase (implémentation réelle) :
\`\`\`typescript
// src/<domain>/gateways/supabase-<name>.gateway.ts
\`\`\`

### 5. Store

Slice state :
\`\`\`typescript
interface MyState { ... }
const initialState: MyState = { ... }
\`\`\`

Selectors à créer dans `<domain>.selector.ts` :

- selectXxx(state: AppState): ...

State-builder (pour les tests) :
\`\`\`typescript
// src/<domain>/store/<domain>.state-builder.ts
\`\`\`

### 6. Usecases

Liste ordonnée — chaque usecase avec pattern tryCatch obligatoire :

1. `<domain>/actionName` — [description]
   - Paramètres : ...
   - Erreurs possibles : NO_USER, ...
   - Side effects : ...

### 7. View-models

Pour chaque écran :

- Selectors consommés
- Actions exposées
- Types de vue (Idle, Loading, Fulfilled, Rejected...)

### 8. Screens / UI

[Si .claude/design-spec.md existe, référencer ses décisions ici.]

- Écran(s) à créer/modifier
- Route Expo Router (re-export uniquement dans app/)
- Composants DS à utiliser

### 9. Comportements à couvrir (liste pour TDD)

Liste ordonnée baby-steps — du plus simple au plus complexe :

1. État initial → status: 'idle'
2. Pendant le chargement → status: 'loading'
3. Succès → données présentes, status: 'fulfilled'
4. Erreur gateway → status: 'rejected'
5. [cas métier spécifiques...]

### 10. Séquence de build

Phase 1 — Domain model + factory
Phase 2 — Gateway interface + fake
Phase 3 — Store : slice + selectors + state-builder
Phase 4 — Usecases (TDD baby-steps)
Phase 5 — View-models (TDD)
Phase 6 — Screen / UI
Phase 7 — Supabase gateway + wiring DI
Phase 8 — Tests d'intégration si gateway Supabase créée

### 11. Contraintes critiques

[Pièges spécifiques à cette feature : race conditions, ordre d'opérations, dépendances entre usecases, etc.]
```

---

## Ce que tu NE fais PAS

- Tu n'écris pas de code de production
- Tu ne prends pas de décisions UI non couvertes par design-spec.md
- Tu ne démarres pas l'implémentation

Une fois `.claude/blueprint.md` écrit : **"Blueprint prêt — lancer /build pour implémenter."**
