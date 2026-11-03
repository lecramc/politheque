Implémente le blueprint en TDD strict, baby steps. Tu exécutes — tu ne décides pas.

## Vérification d'entrée — OBLIGATOIRE

Avant tout, vérifier que `.claude/blueprint.md` existe et est complet.

**Si `.claude/blueprint.md` est absent → STOP.**
Répondre : "Blueprint manquant. Lance /archi d'abord."

**Si une section du blueprint est ambiguë ou contredit le codebase → STOP.**
Signaler précisément l'ambiguïté. Ne pas improviser.

---

## Lecture obligatoire

1. `.claude/blueprint.md` — en entier. C'est l'unique référence.
2. Les fichiers existants mentionnés dans la section "Fichiers impactés".

---

## Cycle TDD obligatoire — baby steps

**Règle absolue : un seul test rouge à la fois.**

### RED → GREEN → REFACTOR

**RED** : écrire UN test qui échoue pour la bonne raison (pas une erreur de compilation).

```bash
npx jest --watchAll=false --testPathPattern=<fichier>
```

Vérifier que le test échoue. Si le test passe sans code : mal écrit, le réécrire.

**GREEN** : code minimal pour faire passer ce test.

- Fake it si ça suffit (valeur hardcodée)
- Obvious implementation si la solution est triviale
- Jamais d'anticipation — ne pas coder ce que les tests futurs demanderont

**REFACTOR** : nettoyer sans changer le comportement. Relancer les tests.

Répéter jusqu'à ce que tous les comportements de la section 9 du blueprint soient couverts.

---

## Séquence de phases — suivre l'ordre du blueprint

Après chaque phase :

```bash
npm run test:run
```

Tous les tests doivent passer avant de passer à la phase suivante.

### Phase 1 — Domain model + factory

### Phase 2 — Gateway interface + fake

### Phase 3 — Store : slice + selectors + state-builder

### Phase 4 — Usecases (TDD baby-steps)

### Phase 5 — View-models (TDD)

### Phase 6 — Screen / UI

### Phase 7 — Supabase gateway + wiring

### Phase 8 — Tests d'intégration (si gateway Supabase créée)

```bash
npm run test:integration
```

---

## Patterns obligatoires

### Usecase

```typescript
export const myUsecase = createAppAsyncThunk(
  'domain/actionName',
  async (params, { getState, rejectWithValue, extra: { myGateway } }) => {
    const user = getState().authentication.authUser;
    if (!user) return rejectWithValue('NO_USER');
    const response = await tryCatch(myGateway.doSomething(params));
    if (isFailure(response)) return rejectWithValue(response.reason);
    return response.value;
  }
);
```

### Slice extraReducers

```typescript
builder
  .addCase(myUsecase.pending, (state) => {
    state.status = 'loading';
  })
  .addCase(myUsecase.fulfilled, (state, action) => {
    state.data = action.payload;
    state.status = 'fulfilled';
  })
  .addCase(myUsecase.rejected, (state) => {
    state.status = 'rejected';
  });
```

### Test usecase

```typescript
describe('Feature: <description>', () => {
  it('should <comportement>', async () => {
    const gateway = new FakeMyGateway();
    const store = createTestStore({
      initialState: stateBuilder().withAuthUser(user).build(),
      dependencies: { myGateway: gateway },
    });
    await store.dispatch(myUsecase(params));
    expect(store.getState().<domain>.<field>).toEqual(expectedValue);
  });
});
```

### Fichiers app/ — re-export uniquement

```typescript
export { default } from '@/src/<domain>/screens/my-screen';
```

---

## Stopping conditions — ne jamais improviser

Demander confirmation à l'utilisateur si :

- Le blueprint référence un fichier qui n'existe pas
- Une phase du blueprint contredit un pattern existant dans le codebase
- Une migration Supabase est nécessaire mais le SQL n'est pas dans le blueprint
- Deux phases du blueprint sont mutuellement inconsistantes

---

## Ce que tu NE fais PAS

- Tu ne prends pas de décisions d'architecture non couvertes par le blueprint
- Tu ne sautes pas de phase
- Tu n'écris pas plusieurs tests à la fois
- Tu ne commites pas

Une fois tous les tests verts et toutes les phases terminées : **"Prêt pour review — lancer /review."**
