# Blueprint — Parcours citoyen (piste A)

> **Mise à jour (simplification v2, `docs/ux/spec-simplification-v2.md`).** Le chemin illustré de l'accueil et les pages `/parcours/*` n'existent plus. Les six étapes sont les chapitres de `/comprendre` (les bases, les institutions, la présidentielle) suivis de « Ensuite » (fiches, débats, questionnaire). L'accueil présente quatre tâches et une carte « Le parcours ». « Ma progression » (`/passeport`) et les tampons restent ; le registre de lecture (`progress.v1`) et la règle « mesurer la lecture, jamais les opinions » sont inchangés. Les anciennes adresses redirigent (`vercel.json`). Le reste de ce document décrit l'état avant v2.

> Statut : blueprint d'implémentation, aucun code de production écrit.
> Source UX : `docs/ux/maquettes-parcours.html` (piste A) et `docs/ux/captures-parcours/a1…a5`.
> Décision de DA (validée) : **l'arc de progression reste bleu**. Le tricolore reste réservé au
> logo (`LogoMark`) et au liseré (`Tricolore`). Il n'apparaît dans le parcours qu'une fois, à
> l'arrivée, par la demi-cocarde du logo.

---

## 1. Décision en une phrase

L'accueil devient un **chemin de six étapes** calculé par un service pur à partir du catalogue
et d'un registre local de **contenus lus typés** (`progress.v1`). Ce registre généralise le
`ReadingProgressGateway` actuel. La barre d'onglets, les liens directs et le reste du site ne
changent pas, et aucun contenu n'est verrouillé.

---

## 2. Principes non négociables (rappel des maquettes, traduits en règles de code)

| Principe                                | Règle de code                                                                                                                          | Garanti par                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Un chemin, pas un mur                   | Aucun type `locked` n'existe. Chaque étape a un `href` dès 0 %                                                                         | test « no step is ever locked »            |
| Mesurer la lecture, jamais les opinions | Le stockage ne contient que des clés `type:id` → date ISO. Les réponses du questionnaire ne sont jamais persistées                     | test « should never persist quiz answers » |
| Égalité entre partis                    | Ordre = ordre du gateway (`localeCompare('fr')`). Même `Stamp` sans prop couleur. « Fiche suivante » = première non lue dans cet ordre | `journey-neutrality.test.ts`               |
| Rien de culpabilisant                   | Pas de série, de score, de niveau ni de notification. Le vocabulaire est centralisé dans `journey.copy.ts`                             | test de vocabulaire                        |
| Sur l'appareil uniquement               | Mention + « Effacer » sur l'accueil et le passeport                                                                                    | `clearReadingProgressUsecase`              |
| Accessibilité                           | Liste ordonnée, libellé complet par étape, `aria-current="step"`. L'état n'est jamais porté par la seule couleur                       | test de `nodeAccessibilityLabel`           |

---

## 3. Contenu réel des six étapes

Les données viennent de `guide.json` (9 sections), `data/parties/` (10 partis), `themes.json`
(9 débats), `data/elections/` (élection mise en avant) et `questions.ts`.

| #   | `JourneyStepId`       | Titre                  | Icône (Ionicons)      | Contenus (clés)                                                                                                                    | Unité                                            |
| --- | --------------------- | ---------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `les-bases`           | Les bases              | `book-outline`        | `guide:gauche-droite`, `guide:classement-des-partis`, `guide:desinformation`                                                       | lecture(s)                                       |
| 2   | `les-institutions`    | Les institutions       | `business-outline`    | `guide:institutions`, `guide:pouvoirs-du-president`, `guide:union-europeenne`, `guide:budget-dette`                                | lecture(s)                                       |
| 3   | `les-partis`          | Les partis             | `people-outline`      | `party:<id>` pour **chaque** parti du catalogue, dans l'ordre du gateway                                                           | fiche(s)                                         |
| 4   | `les-grands-debats`   | Les grands débats      | `chatbubbles-outline` | `debate:<themeId>` pour chaque thème, dans l'ordre de `themes.json`                                                                | débat(s)                                         |
| 5   | `presidentielle-2027` | La présidentielle 2027 | `calendar-outline`    | `guide:election-presidentielle`, `guide:comment-voter`, `election:<id de l'élection featured>` (libellé « Les candidatures 2027 ») | lecture(s)                                       |
| 6   | `me-situer`           | Me situer              | `compass-outline`     | `quiz:done`                                                                                                                        | affirmations (méta : « N affirmations · 5 min ») |

- Les étapes 1, 2 et 5 (côté guide) sont des constantes dans `journey.model.ts`. Les étapes 3, 4
  et l'item élection sont **dérivés du catalogue** : on ne code en dur aucun id de parti ni de
  thème. Un nouveau parti entre donc automatiquement dans l'étape 3.
- Les neuf sections du guide sont réparties **une et une seule fois** (3 + 4 + 2). Un test
  d'intégrité le vérifie.
- Si aucune élection n'est `featured`, l'étape 5 ne contient que ses deux sections du guide.
- Les étapes à **un seul contenu** (aujourd'hui seulement « Me situer ») renvoient directement
  vers ce contenu (`/me-situer`). Les autres renvoient vers la page d'étape `/parcours/[etape]`.

### Écart avec `GUIDE_GROUPS` (à arbitrer, voir § 14)

`GUIDE_GROUPS` (page Comprendre) range aujourd'hui `institutions` et `union-europeenne` dans
« Les bases », et `pouvoirs-du-president` dans « L'élection ». Le parcours, lui, suit la
maquette. **Recommandation** : dériver `GUIDE_GROUPS` de la définition du parcours (une seule
taxonomie : Les bases / Les institutions / La présidentielle 2027). Sinon, « Les bases » ne
désigne pas les mêmes sections sur deux écrans.

---

## 4. Modèle de domaine pur

Tous ces fichiers sont dans `src/programmes/models/`. Ce sont des fonctions pures, testées, sans
React ni Redux.

### 4.1 `reading-progress.model.ts` — contenus lus typés

```ts
export type IsoDateTime = string; // new Date().toISOString()

export type ContentType = 'guide' | 'party' | 'debate' | 'election' | 'quiz' | 'stamp';

export type ContentKey =
  | `guide:${string}`
  | `party:${string}`
  | `debate:${string}`
  | `election:${string}`
  | 'quiz:done'
  | `stamp:${JourneyStepId}`;

/** Date ISO de PREMIÈRE lecture, par clé. Aucune autre donnée. */
export type ReadingEntries = Readonly<Record<string, IsoDateTime>>;

export const contentKey: {
  guide(id: string): ContentKey;
  party(id: string): ContentKey;
  debate(themeId: string): ContentKey;
  election(id: string): ContentKey;
  quizDone: 'quiz:done';
  stamp(step: JourneyStepId): ContentKey;
};

/** `type:id` avec id ∈ [a-z0-9-]+ ; renvoie null si mal formé. */
export function parseContentKey(raw: string): { type: ContentType; id: string } | null;

/** Nettoie une valeur lue du stockage : garde les clés bien formées dont la date est ISO valide.
 *  Les clés bien formées d'un type inconnu sont CONSERVÉES (compatibilité ascendante) mais
 *  ignorées par les calculs. */
export function sanitizeEntries(raw: unknown): ReadingEntries;

/** Union de deux registres ; en cas de doublon, la date la plus ancienne gagne. */
export function mergeEntries(a: ReadingEntries, b: ReadingEntries): ReadingEntries;

/** Ancien format (`guide.read-sections` : string[]) → registre. Date = `now` (l'ancienne date est
 *  inconnue). Ignore tout ce qui n'est pas une chaîne. */
export function migrateLegacyGuideIds(legacy: unknown, now: IsoDateTime): ReadingEntries;

export const isRead = (entries: ReadingEntries, key: ContentKey) => key in entries;
```

Pourquoi les tampons sont stockés (`stamp:<step>`) : la maquette exige qu'**un tampon gagné reste
acquis** quand du contenu est ajouté (11e parti). On ne peut pas le recalculer après coup : il
faut donc le mémoriser. La clé `stamp:` ne contient qu'une date, comme les autres.

### 4.2 `journey.model.ts` — définition

```ts
export type JourneyStepId =
  | 'les-bases'
  | 'les-institutions'
  | 'les-partis'
  | 'les-grands-debats'
  | 'presidentielle-2027'
  | 'me-situer';

export const JOURNEY_STEP_IDS: readonly JourneyStepId[]; // ordre conseillé

export type JourneyItemKind = 'guide' | 'party' | 'debate' | 'election' | 'quiz';

export type JourneyItem = {
  key: ContentKey;
  kind: JourneyItemKind;
  title: string; // titre réel (section, nom du parti, thème…)
  href: string; // route canonique, voir § 9
  partyColor?: string; // anneau PartyDot seulement (comme partout sur le site)
};

export type JourneyStep = {
  id: JourneyStepId;
  index: number; // 1..6
  title: string;
  icon: string; // nom Ionicons
  unit: { one: string; many: string }; // « lecture/lectures », « fiche/fiches »…
  items: JourneyItem[];
};

export type Journey = readonly JourneyStep[];

/** Ids du guide des étapes 1, 2, 5 (la seule partie codée en dur). */
export const JOURNEY_GUIDE_IDS: Record<
  'les-bases' | 'les-institutions' | 'presidentielle-2027',
  string[]
>;

/** Construit le parcours depuis le catalogue (ordre des partis = ordre du catalogue). */
export function buildJourney(catalog: Catalog): Journey;

/** Route canonique d'un contenu à partir de sa clé. */
export function hrefOf(key: ContentKey): string;

/** Lien d'une étape : contenu unique → ce contenu ; sinon `/parcours/<id>`. */
export function stepHref(step: JourneyStep): string;
```

### 4.3 `journey.service.ts` — calculs

```ts
export type StepStatus = 'todo' | 'in-progress' | 'done'; // jamais « locked »

export type StepProgress = {
  step: JourneyStep;
  readCount: number;
  total: number;
  ratio: number; // 0..1 (0 si total = 0)
  status: StepStatus; // todo: 0 lu ; done: tous lus ; sinon in-progress
  stamped: boolean; // `stamp:<id>` présent (reste vrai si du contenu est ajouté)
  newItems: number; // stamped && !done → nombre de contenus non lus (« 1 nouvelle fiche »)
  nextItem: JourneyItem | null; // premier non lu dans l'ordre des items (alphabétique pour les partis)
};

export type JourneyProgress = {
  steps: StepProgress[];
  stampedCount: number; // « 3 sur 6 étapes »
  total: number; // 6
  hasStarted: boolean; // au moins un contenu lu
  next: StepProgress | null; // première étape non `done` dans l'ordre conseillé ; null si tout est fait
  finished: boolean; // les 6 tampons sont obtenus
};

export function computeJourneyProgress(journey: Journey, entries: ReadingEntries): JourneyProgress;

/** Étapes complètes (tous les contenus lus) sans tampon encore enregistré. */
export function stampsToAward(journey: Journey, entries: ReadingEntries): JourneyStepId[];
```

Règles :

- **Étape conseillée** = première étape non `done` dans l'ordre 1 → 6. Ce n'est qu'une
  suggestion : on peut finir l'étape 4 avant la 3 (capture A2).
- **Étape terminée** seulement quand tous ses contenus sont lus (10/10 pour les partis).
- `finished` repose sur les tampons (acquis), pas sur `done`. Si un 11e parti arrive, le
  parcours reste « terminé », mais l'étape 3 repasse en cours avec « 1 nouvelle fiche ».
- Les clés lues qui ne correspondent plus à un contenu existant (parti retiré) sont ignorées
  dans les comptes. On les garde en stockage.

### 4.4 `journey.copy.ts` — vocabulaire (pur, testé)

Tout le texte qui dépend de la progression passe par ces fonctions. Il reste en français
codé en dur comme le reste de `src/programmes/` (aucun écran n'utilise encore i18n, voir § 14).

```ts
stepMeta(p: StepProgress, opts?: { daysLeft?: number | null; questionCount?: number }): string
//  todo        → « 3 lectures », « 10 fiches », « 9 débats », « 30 affirmations · 5 min »
//  in-progress → « 4 sur 10 fiches »
//  done        → « 3 sur 3 lectures »
//  stamped && newItems → « 10 sur 11 fiches · 1 nouvelle fiche »
//  étape 5     → suffixe « · J-165 » si daysLeft connu
ctaLabel(p: StepProgress): 'Commencer' | 'Continuer'
nodeAccessibilityLabel(p: StepProgress, isNext: boolean, total: number): string
//  « Étape 3 sur 6 : Les partis, 4 sur 10 fiches, en cours, étape conseillée »
stepInvite(p: StepProgress): string | null
//  partis : « Encore 6 fiches à découvrir. Lire tous les partis, y compris ceux dont on se sent
//  loin, c'est la meilleure façon de se faire un avis. » (texte fixe, sans lien avec les réponses)
itemStatusLabel(read: boolean): 'Fiche lue' | 'À découvrir' // libellé adapté au type
summaryLabel(stampedCount, total): string // « 3 sur 6 étapes »
```

Mots interdits (vérifiés par un test sur toutes les sorties possibles) : « raté », « retard »,
« score », « niveau », « points », « série », « bravo », « champion ».

### 4.5 `reach-end.service.ts` — détection de fin de lecture

```ts
export const READ_THROUGH_RATIO = 0.85;
export function hasReachedEnd(
  m: { offsetY: number; viewportHeight: number; contentHeight: number },
  ratio = READ_THROUGH_RATIO
): boolean;
// vrai si (offsetY + viewportHeight) >= ratio * contentHeight, ou si le contenu tient sans défiler
```

---

## 5. Persistance

### 5.1 Interface (modifiée) — `gateways/reading-progress.gateway.ts`

```ts
/** Contenus lus et tampons, conservés uniquement sur l'appareil du visiteur. */
export interface ReadingProgressGateway {
  /** Registre courant (migre l'ancien format si besoin). Ne rejette jamais : {} en cas d'erreur. */
  load(): Promise<ReadingEntries>;
  /** Remplace le registre. Échec silencieux (navigation privée) : la progression reste en mémoire. */
  save(entries: ReadingEntries): Promise<void>;
  /** Supprime `progress.v1` ET l'ancienne clé `guide.read-sections`. */
  clear(): Promise<void>;
}
```

Le nom et la clé de dépendance `readingProgressGateway` restent les mêmes : pas de renommage
inutile dans `Dependencies`.

### 5.2 Fake — `gateways/fake-reading-progress.gateway.ts`

```ts
export class FakeReadingProgressGateway implements ReadingProgressGateway {
  entries: ReadingEntries = {};
  saveCount = 0;
  cleared = false;
  async load() {
    return this.entries;
  }
  async save(entries) {
    this.entries = entries;
    this.saveCount++;
  }
  async clear() {
    this.entries = {};
    this.cleared = true;
  }
}
```

### 5.3 Implémentation — `gateways/async-storage-reading-progress.gateway.ts`

- Constructeur : `(storage: KeyValueStorage = AsyncStorage, clock: Clock = systemClock)`, où
  `KeyValueStorage = Pick<AsyncStorageStatic, 'getItem' | 'setItem' | 'removeItem'>`. On peut
  ainsi tester la migration avec un stockage en mémoire (Vitest remplace AsyncStorage par un
  mock vide).
- Clés : `progress.v1` (nouvelle), `guide.read-sections` (ancienne).
- `load()` :
  1. lit `progress.v1` ; si la valeur existe → `sanitizeEntries(JSON.parse)` (JSON corrompu → `{}`) ;
  2. sinon, lit `guide.read-sections` ; si elle existe → `migrateLegacyGuideIds(…, clock.now().toISOString())`,
     écrit `progress.v1`, supprime l'ancienne clé ;
  3. si les deux existent, `progress.v1` gagne et l'ancienne clé est supprimée.
- Format stocké : l'objet plat `{ "guide:institutions": "2026-11-04T10:12:00.000Z", "party:lfi": "…", "quiz:done": "…", "stamp:les-bases": "…" }`.
- Toutes les erreurs de stockage sont avalées, comme aujourd'hui.

### 5.4 Horloge — nouvelle dépendance

Les dates doivent être déterministes en test.

- `gateways/clock.gateway.ts` : `export interface Clock { now(): Date }`
- `gateways/system-clock.gateway.ts` : `export const systemClock: Clock = { now: () => new Date() }`
- `gateways/fake-clock.gateway.ts` : `export class FakeClock implements Clock { constructor(public current = new Date('2026-11-04T10:00:00.000Z')) {} now() { return this.current; } }`
- `Dependencies` gagne `clock: Clock`. `createTestStore` injecte `new FakeClock()` par défaut et
  `src/core/store/index.ts` injecte `systemClock`.

### 5.5 Ce qui n'est **jamais** stocké

Ni les réponses, ni l'importance, ni l'index courant du questionnaire, ni le résultat de
proximité (l'état `quiz` reste en mémoire, comme aujourd'hui), ni l'onglet consulté, ni le temps
de lecture. Le registre ne contient que des clés et des dates.

### 5.6 « Effacer ma progression »

`clearReadingProgressUsecase` appelle `gateway.clear()`, vide `entries` et `celebrations`, et
laisse `status` à `ready`. L'interface demande une confirmation (feuille `Sheet` existante :
« Effacer votre progression sur cet appareil ? Les pages lues et les tampons seront remis à
zéro. » + `Button variant="danger"` « Effacer » + « Annuler »). Effacer ne touche pas aux réponses
en mémoire du questionnaire.

---

## 6. Règles « lu » par type de contenu

Il y a **un seul mécanisme générique**, la fin de lecture (`Page onReachEnd`), plus deux
exceptions qui existent déjà ou viennent de la maquette. Ces règles tiennent en export web
statique comme en natif : `ScrollView` de react-native-web émet `onScroll` comme en natif, et
on n'utilise ni IntersectionObserver ni minuterie.

| Type               | Quand marquer                                                                                                                                                          | Pourquoi                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `guide:<id>`       | **Inchangé** : ouverture du dernier bloc de l'accordéon, ou appui sur « Suite : … »                                                                                    | Comportement connu et testé ; avec les accordéons fermés, la page est trop courte pour qu'une règle de défilement ait du sens                                                                    |
| `party:<id>`       | Fin de lecture atteinte sur **n'importe quel onglet** de la fiche (85 % du contenu défilé, ou contenu entièrement visible), **ou** ouverture de l'onglet « Positions » | Suit la maquette ; une seule clé par parti, quel que soit l'onglet (voir § 9)                                                                                                                    |
| `debate:<themeId>` | Fin de lecture de `/debats/[id]` (85 %)                                                                                                                                | Pages longues : il faut un vrai parcours                                                                                                                                                         |
| `election:<id>`    | Fin de lecture de `/elections/[id]` (85 %)                                                                                                                             | **Écart volontaire avec la maquette** (qui disait « page ouverte ») : une seule règle pour toutes les pages de contenu. Comme la page est courte sur desktop, cela revient souvent à l'ouverture |
| `quiz:done`        | À l'appel de `showResults` (passage aux résultats), **seulement si chaque question a une entrée** dans `quiz.values` (« pas d'avis » = `null` compte)                  | La maquette dit « 30 réponses données, sans avis compris ». « Voir mes résultats » avant la fin ne donne pas le tampon                                                                           |
| `stamp:<step>`     | Calculé, jamais déclenché par un écran : écrit par les usecases quand une étape devient complète                                                                       | Voir § 7.2                                                                                                                                                                                       |

Détails d'implémentation de `onReachEnd` dans `Page` :

- Nouvelle prop optionnelle `onReachEnd?: () => void`, ignorée tant que `loading` est vrai.
- `ScrollView` reçoit `onScroll` (`scrollEventThrottle={200}`), `onContentSizeChange` et
  `onLayout`. Chaque mesure passe par `hasReachedEnd`. Pour le cas « tout tient à l'écran »,
  on évalue aussi après `onContentSizeChange`.
- L'appel n'a lieu **qu'une fois par montage** (ref), et le usecase est de toute façon idempotent.
- `contentHeight` exclut le pied de page (« Site indépendant… ») : on mesure la `View` du contenu
  par `onLayout`, pas `contentSize`. Sinon le pied de page déclencherait le marquage trop tôt.
- Le défilement au clavier, le lecteur d'écran (qui fait défiler) et l'ancre de lien
  déclenchent tous `onScroll` : la règle reste accessible.

---

## 7. Redux

### 7.1 Slice — `store/progress.slice.ts` (remplace `reading.slice.ts`)

```ts
export type ProgressState = {
  /** 'unknown' tant que le stockage n'a pas été lu (rendu statique, premier rendu natif). */
  status: 'unknown' | 'ready';
  entries: ReadingEntries;
  /** Tampons obtenus PENDANT cette session et pas encore montrés (animation à jouer une fois). */
  celebrations: JourneyStepId[];
};
// initialState : { status: 'unknown', entries: {}, celebrations: [] }
// reducers : celebrationsShown(stepIds: JourneyStepId[]) — retire ces ids de `celebrations`
// extraReducers :
//   loadReadingProgressUsecase.fulfilled  → status 'ready', entries (aucune célébration)
//   markContentReadUsecase.fulfilled      → entries, celebrations += newStamps
//   markQuizDoneUsecase.fulfilled         → idem (via markContentRead)
//   clearReadingProgressUsecase.fulfilled → entries {}, celebrations []
```

Clé du root reducer : `progress` (remplace `reading`). On met à jour `create-store.ts`.

### 7.2 Usecases — `usecases/reading-progress.usecase.ts`

```ts
loadReadingProgressUsecase = createAppAsyncThunk(
  'progress/load',
  async (_, { extra: { readingProgressGateway, clock }, getState }) => {
    const stored = await readingProgressGateway.load();
    const merged = mergeEntries(stored, getState().progress.entries); // marquages faits avant la fin du chargement
    const journey = buildJourney(catalogOrEmpty(getState()));
    const awarded = withStamps(merged, stampsToAward(journey, merged), clock.now()); // tampons silencieux (migration, contenus déjà finis)
    if (awarded !== stored) await readingProgressGateway.save(awarded);
    return awarded;
  }
);

markContentReadUsecase = createAppAsyncThunk(
  'progress/markRead',
  async (key: ContentKey, { extra, getState }) => {
    // Relire le stockage avant d'écrire : évite d'écraser une progression non encore chargée
    // (marquage avant la fin du load) ou écrite par un autre onglet web.
    const stored = await extra.readingProgressGateway.load();
    const base = mergeEntries(stored, getState().progress.entries);
    if (key in base) return { entries: base, newStamps: [] };
    const now = extra.clock.now().toISOString();
    const withKey = { ...base, [key]: now };
    const newStamps = stampsToAward(buildJourney(catalogOf(getState())), withKey);
    const entries = withStamps(withKey, newStamps, now);
    await extra.readingProgressGateway.save(entries);
    return { entries, newStamps };
  },
  { condition: (key, { getState }) => !(key in getState().progress.entries) }
);

markQuizDoneUsecase = createAppAsyncThunk(
  'progress/markQuizDone',
  async (_, { getState, dispatch }) => {
    const { quiz, programmes } = getState();
    if (!isQuizComplete(programmes.catalog?.questions ?? [], quiz.values)) return; // pur, dans journey.service
    await dispatch(markContentReadUsecase(contentKey.quizDone));
  }
);

clearReadingProgressUsecase = createAppAsyncThunk('progress/clear', async (_, { extra }) => {
  await extra.readingProgressGateway.clear();
});
```

`isQuizComplete(questions, values)` (pur, dans `journey.service.ts`) : vrai si
`questions.length > 0` et que chaque `question.id in values`. Le service ne lit **que la
présence** d'une réponse, jamais sa valeur.

### 7.3 Selectors — `store/programmes.selector.ts` (ajouts)

```ts
selectProgressStatus = (s) => s.progress.status;
selectReadingEntries = (s) => s.progress.entries;
selectCelebrations = (s) => s.progress.celebrations;
selectReadIds = createSelector([selectReadingEntries], guideIdsOf); // compat : ids du guide lus
selectJourney = createSelector([selectCatalog], (c) => buildJourney(c ?? EMPTY_CATALOG));
selectJourneyProgress = createSelector(
  [selectJourney, selectReadingEntries],
  computeJourneyProgress
);
```

`selectReadIds` garde sa signature (`string[]` d'ids du guide), donc `guide.view-model.ts` ne
change pas, sauf `markRead`, qui appelle maintenant
`markContentReadUsecase(contentKey.guide(id))`.

### 7.4 View-models

**`view-models/journey.view-model.ts`** (accueil) — `journeyViewModel(now = new Date())`

```ts
({ dispatch }) => createSelector(
  [selectProgressStatus, selectJourneyProgress, selectCelebrations, selectFeaturedElection, selectCatalog],
  (status, progress, celebrations, election, catalog) => ({
    hydrated: status === 'ready',
    summary: hydrated && progress.hasStarted
      ? { stampedCount, total, label: '3 sur 6 étapes', next: { title, meta, href } | null }
      : null,                                   // null → on affiche l'intro (A1)
    nodes: progress.steps.map((p) => ({
      id, index, title, icon, href: stepHref(p.step),
      ratio: hydrated ? p.ratio : 0,
      status: hydrated ? p.status : 'todo',
      stamped: hydrated && p.stamped,
      isNext: hydrated && progress.next?.step.id === p.step.id,
      meta: stepMeta(hydrated ? p : asTodo(p), { daysLeft, questionCount }),
      cta: hydrated && isNext ? ctaLabel(p) : null,
      accessibilityLabel: nodeAccessibilityLabel(…),
      chips: p.step.items.map(({ title, href, key }) => ({ title, href, read })), // desktop
      segmentDone: hydrated && p.status === 'done',     // tronçon plein sous une étape terminée
    })),
    finished: hydrated && progress.finished,
    news: election ? { title, roundLabel, dateLabel, daysLeft, href } : null,   // ex-« À la une »
    passport: { stampedCount, total },
    celebrations,                               // étapes dont le tampon doit « se poser »
    celebrationsShown: (ids) => dispatch(progressActions.celebrationsShown(ids)),
    clearProgress: () => dispatch(clearReadingProgressUsecase()),
  }));
```

**`view-models/journey-step.view-model.ts`** — `journeyStepViewModel(stepId)`

```ts
→ { hydrated, found: boolean, index, total: 6, title, intro (texte fixe par étape),
    ratio, readCount, itemTotal, invite: stepInvite(p) | null,
    items: [{ key, title, href, kind, partyColor?, read, statusLabel, stamp: { state: 'stamped' | 'empty' } }],
    orderNote: 'Ordre alphabétique' (partis seulement),
    nextItem: { title, href, label: 'Fiche suivante (ordre alphabétique) : La France insoumise' } | null,
    footnote: 'Le tampon de l'étape s'obtient avec les 10 fiches. Rien n'est bloqué en attendant.' }
```

**`view-models/passport.view-model.ts`** — `passportViewModel`

```ts
→ { hydrated, finished, stampedCount, total,
    heading: finished ? 'Vous êtes prêt·e à voter en connaissance de cause' : 'Passeport du citoyen',
    stamps: steps.map((p) => ({ stepId, title, icon, state: p.stamped ? 'stamped' : 'empty' })),
    quizNote: 'Le tampon « Me situer » indique que vous avez répondu au questionnaire, jamais ce que vous avez répondu.',
    parties: { countLabel: '10 sur 10 fiches lues · ordre alphabétique', items: [{ title, href, state }] },
    debates: { countLabel: '9 sur 9 débats lus', items: [...] },
    whatNow: { label: 'Comment voter', href: '/comprendre/comment-voter' },
    celebrations, celebrationsShown, clearProgress }
```

**View-models existants modifiés** (ajout d'une action, aucune logique dans les écrans) :

- `party.view-model.ts` : `markRead: () => dispatch(markContentReadUsecase(contentKey.party(id)))`
- `theme.view-model.ts` (`themeViewModel`) : `markRead` → `debate:<themeId>`. Il faut d'abord
  le passer à la signature `({ dispatch }) => …`.
- `elections.view-model.ts` (`electionViewModel`) : `markRead` → `election:<id>`
- `guide.view-model.ts` : `markRead` → `guide:<id>`
- `quiz.view-model.ts` : `showResults` dispatche `quizActions.finish()`, puis `markQuizDoneUsecase()`,
  puis navigue
- `home.view-model.ts` : **supprimé**. Son calcul « featured » passe dans `journeyViewModel.news`.

### 7.5 Listeners

**Aucun.** Le marquage est explicite (view-model → usecase) et les tampons sont calculés dans les
usecases. Il n'y a aucun effet de bord réactif à orchestrer. On a écarté un listener sur
`quizActions.finish` : il cacherait la règle « questionnaire complet » loin de l'action qui la
déclenche. Nous n'ajoutons pas non plus la synchronisation entre onglets web (événement
`storage`) : la relecture du stockage avant chaque écriture (§ 7.2) suffit à ne rien perdre.

### 7.6 Chargement

`GlobalEffects` dispatche `loadReadingProgressUsecase()` après `loadCatalogUsecase()`, comme
aujourd'hui. Sur le web, le catalogue est préchargé dans `store/index.ts`, ce qui permet au
calcul des tampons du load d'avoir le parcours. En natif, `GlobalEffects` attend le catalogue
avant de lancer le load (`await dispatch(loadCatalogUsecase())`).

---

## 8. Écrans et composants

### 8.1 Routes

| Route (`app/`)                       | Re-export              | Notes                                                                                             |
| ------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `app/index.tsx`                      | `HomeScreen` (réécrit) | inchangé côté route                                                                               |
| `app/parcours/[etape].tsx` (nouveau) | `JourneyStepScreen`    | `generateStaticParams()` → `JOURNEY_STEP_IDS` sans `me-situer` (étape à contenu unique)           |
| `app/passeport.tsx` (nouveau)        | `PassportScreen`       | `<meta name="robots" content="noindex">` via `Head` (le HTML statique serait vide de progression) |

Barre d'onglets : inchangée. `/parcours/*` et `/passeport` n'activent aucun onglet (le
`activeIndex` de `Page` vaut −1). Le retour (« ‹ Parcours ») pointe vers `/`.

### 8.2 Ce que devient l'accueil actuel

| Élément actuel                                                                                | Devenir                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre « La politique française, expliquée simplement »                                        | Remplacé par l'intro A1 : kicker « Votre parcours citoyen » + « Comprendre la politique française, une étape à la fois » + phrase « Six étapes dans un ordre conseillé. Vous pouvez aussi aller directement où vous voulez. »                                                                                                                                                                                          |
| Bloc « À la une » + grand arc compte à rebours + pastilles candidats + « Voir les candidats » | **Mobile** : `NewsBanner` d'une ligne sous l'en-tête, au-dessus du chemin (« Présidentielle 2027 · 1er tour le 18 avril 2027 · J-165 › ») : l'actualité reste visible sans défiler. **Desktop** : carte dans la colonne de gauche (A5). Le J-165 figure aussi dans la méta de l'étape 5. Le grand arc du compte à rebours reste sur `ElectionScreen`, qui l'a déjà. Les pastilles candidats disparaissent de l'accueil |
| CTA « Me situer »                                                                             | Devient l'étape 6 du chemin (et reste dans la barre d'onglets)                                                                                                                                                                                                                                                                                                                                                         |
| Tuiles Comprendre / Partis / Débats / Élections                                               | Supprimées : le chemin et la barre d'onglets les remplacent, et toutes les rubriques restent à un appui                                                                                                                                                                                                                                                                                                                |

### 8.3 `HomeScreen` (réécrit, fin) — `src/programmes/screens/HomeScreen.tsx`

Mobile (A1/A2) : `NewsBanner` → `JourneyHeader` (créneau réservé : `JourneyIntro` ou
`JourneySummary`) → `JourneyPath` → `JourneyArrival` → `PassportLink` → `PrivacyNote`.
Desktop (A5, `useIsDesktop`, `Page wide`) : colonne gauche (`JourneyIntro`, `JourneySummary` ou
grand `Arc`, carte d'étape conseillée, carte `NewsBanner` variante `card`, `PassportLink`,
`PrivacyNote`) ; colonne droite `JourneyPath variant="cards"`, où chaque nœud montre ses
contenus en puces cliquables.
La célébration ne se joue que si l'écran a le focus (`useFocusEffect` d'expo-router). En natif,
l'accueil reste monté sous la pile et ne doit rien animer en arrière-plan.

### 8.4 Nouveaux composants — `src/programmes/components/`

Une responsabilité par composant, styles dans `StyleSheet.create`, aucune navigation impérative.
Les nœuds et les lignes rendent un `Link href` reçu en prop : on garde ainsi de vrais `<a>`
dans l'export statique (référencement, clic milieu). C'est l'exception « lien fixe » admise.

| Composant            | Responsabilité                                                                                                                                                             | Props principales                                                                                                         | Réutilise                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `JourneyPath`        | Liste ordonnée des nœuds + tronçons, décalage en zigzag (mobile) ou colonne + cartes (desktop)                                                                             | `nodes`, `variant: 'compact' \| 'cards'`, `celebrate: JourneyStepId[]`, `onCelebrated(ids)`                               | `JourneyNode`, `JourneySegment`                                       |
| `JourneyNode`        | Une étape : marqueur + textes + pastille d'action                                                                                                                          | `node`, `celebrate?: boolean`                                                                                             | `NodeMarker`, `NodeLabel`, `Link`, `Pressable`                        |
| `NodeMarker`         | Arc (84 px) + disque icône (vide / suivant / plein) + badge coche                                                                                                          | `ratio`, `status`, `isNext`, `icon`, `stamped`                                                                            | `Arc`, `Icon`, `Stamp size="badge"`                                   |
| `NodeLabel`          | « ÉTAPE 3 », titre, mini-tampon, méta, pastille CTA                                                                                                                        | `index`, `title`, `meta`, `cta`, `stamped`                                                                                | `Text`, `Stamp size="mini"`                                           |
| `JourneySegment`     | Tronçon SVG entre deux nœuds : pointillé (`tintBorder`) ou plein (`tint`), tracé animable                                                                                  | `done`, `animateIn?: boolean`, `from`, `to`                                                                               | `react-native-svg`                                                    |
| `JourneyIntro`       | Kicker + titre + phrase (A1)                                                                                                                                               | —                                                                                                                         | `Text`                                                                |
| `JourneySummary`     | Grand arc « 3 sur 6 étapes » + étape conseillée + « Continuer » (A2)                                                                                                       | `summary`                                                                                                                 | `Arc`, `Button variant="brand"`, `LinearGradient` (pastels existants) |
| `JourneyHeader`      | Créneau de hauteur réservée qui passe de `JourneyIntro` à `JourneySummary` en fondu                                                                                        | `summary \| null`, `hydrated`                                                                                             | `Enter`                                                               |
| `JourneyArrival`     | « Arrivée · Vous êtes prêt·e à voter en connaissance de cause. » avec `LogoMark` atténué (opacité 0,45) puis plein si `finished`                                           | `finished`, `celebrate?`                                                                                                  | `LogoMark`                                                            |
| `Stamp`              | **Un seul visuel**, sans couleur en prop : cercle `tint`, anneau intérieur pointillé, icône, rotation de repos −4°. Vide = cercle pointillé `text.disabled`, sans rotation | `state: 'stamped' \| 'empty'`, `size: 'mini' \| 'badge' \| 'row' \| 'cover'`, `icon?`, `accessibilityLabel`, `animateIn?` | `Icon`                                                                |
| `StepItemRow`        | Ligne d'un contenu : anneau parti (`PartyDot`) ou icône, titre, « Fiche lue / À découvrir », `Stamp` à droite                                                              | `item`                                                                                                                    | `PartyDot`, `Stamp`, `Link`, `Pressable`                              |
| `StepHeader`         | Arc (ratio) « 4 sur 10 » + « ÉTAPE 3 SUR 6 » + titre + intro                                                                                                               | `…`                                                                                                                       | `Arc`                                                                 |
| `StepInvite`         | Encart à liseré gauche `tint` (texte fixe)                                                                                                                                 | `text`                                                                                                                    | `Card`                                                                |
| `NewsBanner`         | Ligne ou carte d'actualité de l'élection mise en avant                                                                                                                     | `news`, `variant: 'line' \| 'card'`                                                                                       | `Icon`, `Link`                                                        |
| `PassportLink`       | Ligne « Mon passeport · 3 tampons sur 6 › »                                                                                                                                | `stampedCount`, `total`                                                                                                   | `Card`, `Pressable`, `Icon`                                           |
| `PrivacyNote`        | « Votre progression reste sur cet appareil. Rien n'est envoyé. Effacer »                                                                                                   | `onClear`                                                                                                                 | `Icon` (`phone-portrait-outline`), `Text`                             |
| `ClearProgressSheet` | Confirmation d'effacement                                                                                                                                                  | `isOpen`, `onConfirm`, `onClose`                                                                                          | `Sheet`, `Button` (`danger`, `tertiary`)                              |
| `PassportCover`      | Logo, kicker « PASSEPORT DU CITOYEN », titre, grille 3 × 2 de `Stamp size="cover"` + titres                                                                                | `heading`, `stamps`                                                                                                       | `LogoMark`, `Stamp`, `Card`                                           |
| `StampGrid`          | Grille 2 colonnes de mini-tampons nommés (partis, débats)                                                                                                                  | `title`, `countLabel`, `items`                                                                                            | `Stamp`, `Card`                                                       |

### 8.5 `JourneyStepScreen` — `src/programmes/screens/JourneyStepScreen.tsx`

`Page back={{ label: 'Parcours', href: '/' }}` → `StepHeader` → `StepInvite` (si présent) → en-tête
de liste (« Les 10 fiches · Ordre alphabétique ») → `StepItemRow` × n dans un `RowGroup` (existant)
→ bouton `Button variant="secondary"` « Fiche suivante (ordre alphabétique) : … » → note de bas.
Étape inconnue : « Étape introuvable », comme les autres écrans.

### 8.6 `PassportScreen` — `src/programmes/screens/PassportScreen.tsx`

`Page back={{ label: 'Parcours', href: '/' }}` → `PassportCover` → encart `quizNote` (tintSoft)
→ `StampGrid` partis → `StampGrid` débats → carte « Et maintenant ? » (« Vérifiez que vous êtes
inscrit·e sur les listes électorales. » + `Button variant="secondary"` « Comment voter ») →
`PrivacyNote`. Pas de bouton de partage, pas de résultat du questionnaire, pas de date de
lecture affichée.

### 8.7 Écrans existants modifiés

- `PartyScreen` : `Page onReachEnd={vm.markRead}` ; `changeTab('positions')` appelle aussi `vm.markRead()`.
- `ThemeScreen` et `ElectionScreen` : `Page onReachEnd={vm.markRead}`.
- `GuideSectionScreen` : inchangé (le `vm.markRead` existant change de cible sans changer d'API).
- `Page` : prop `onReachEnd` (§ 6).
- `GuideScreen` : inchangé, sauf si l'alignement de `GUIDE_GROUPS` est retenu (§ 3).
- `MethodologyScreen` : ajouter une ligne « Données personnelles » : la progression de lecture
  est enregistrée uniquement sur l'appareil, sans les réponses au questionnaire, et peut être
  effacée depuis l'accueil.

---

## 9. Compatibilité SEO (onglets de fiche → routes)

Évolution probable : `/partis/[id]/histoire`, `/partis/[id]/positions`, etc.

- **La clé ne contient jamais l'onglet** : `party:<id>`, point. Le marquage dépend de l'id du
  parti, jamais de la route ni du paramètre `onglet`.
- `hrefOf('party:lfi')` renvoie toujours la **route canonique** `/partis/lfi`. Si elle devient un
  layout avec sous-routes, le lien reste valide (onglet par défaut).
- Recommandation pour la migration SEO : déplacer le marquage dans un futur
  `app/partis/[id]/_layout.tsx` → `src/programmes/screens/PartyLayout.tsx`, qui porte `Page`, son
  `onReachEnd` et le `markRead`. Chaque sous-route (onglet) hérite alors de la même règle
  (« fin de n'importe quel onglet » ou « onglet Positions atteint »), sans code en double.
- Si l'on voulait un jour suivre les onglets un par un, la grammaire des clés le permet sans
  migration : `party:lfi` reste la clé qui compte, et d'éventuelles sous-clés d'un nouveau
  type seraient conservées mais ignorées par `sanitizeEntries` et les calculs (§ 4.1).
- Même règle pour `debate:` et `election:` si leurs pages se découpent.

---

## 10. Export statique : premier rendu à l'état 0, puis hydratation

Constat : le HTML statique est généré avec `progress.status = 'unknown'` et `entries = {}`. Le
premier rendu client **doit** produire le même arbre, sinon React signale une erreur
d'hydratation. On ne lit donc jamais `localStorage` de façon synchrone dans l'état initial, et
on n'injecte pas de script avant l'hydratation (piste écartée : risque de décalage avec
react-native-web).

Stratégie « neutre, puis révélation » :

1. **Avant `ready`**, les view-models produisent un état **neutre**, valable pour tout le monde :
   arcs à 0, aucun nœud « suivant », aucune pastille CTA, aucun tampon, méta au format « total
   seul » (« 10 fiches »). L'en-tête affiche l'intro A1. C'est aussi le contenu le plus utile
   pour les moteurs de recherche.
2. **Aucun saut de mise en page** : chaque ligne de nœud a une hauteur fixe (118 px mobile),
   qui réserve la place de la pastille CTA. `JourneyHeader` a une hauteur minimale commune à
   l'intro et au résumé (mesurée au design, environ 200 px mobile). Les textes de compte
   changent sur place, sur la même ligne.
3. **Au passage à `ready`** :
   - les arcs se remplissent de 0 à leur valeur (comportement normal d'`Arc` au montage, le
     même que sur les autres pages) ;
   - la pastille CTA et la mise en évidence du nœud suivant apparaissent en fondu (`duration.page`) ;
   - `JourneyHeader` passe de l'intro au résumé en fondu enchaîné si `hasStarted` ;
   - **aucun tampon ne se « pose »** et aucun tronçon ne se trace : ils s'affichent directement à
     leur état final. Les célébrations ne viennent que de `celebrations`, qui n'est jamais
     rempli par le load.
4. Passeport (`/passeport`) : avant `ready`, tampons vides et comptes masqués (texte de même
   hauteur, invisible, pour éviter « 0 sur 6 » puis « 3 sur 6 »). Ensuite, fondu à l'état réel.
5. En natif, le même `status` gère les quelques millisecondes de lecture d'AsyncStorage. Il n'y a
   pas d'écran de chargement dédié.

Limite assumée : un visiteur qui revient voit l'état neutre pendant le chargement du JavaScript
(le prix d'un site statique sans compte). Navigation privée et autre appareil : la progression
n'est pas retrouvée. C'est assumé, et on ne proposera jamais de compte.

---

## 11. Neutralité : ce que les tests garantissent

Fichier `src/programmes/__tests__/journey-neutrality.test.ts` :

```ts
describe('Feature: neutralité du parcours', () => {
  it('should list the parties of the step in the gateway order (alphabetical, fr)', …);
  it('should keep the catalog order of parties even when read dates differ', …);
  it('should suggest as next party the first unread one in alphabetical order', …);
  it('should give every party item the same stamp model, whatever the party', …);
  //   → pour tous les items : même ensemble de clés, `stamp` deep-equal à état égal, aucune clé de couleur dans `stamp`
  it('should not expose any color in stamp models of the step and passport view-models', …);
  it('should complete the parties step only when every party has been read', …);
  it('should produce the same journey and passport whatever the quiz answers', …);
  //   → deux stores, questionnaires complets aux réponses opposées → view-models deep-equal
  it('should never persist quiz answers, only the quiz:done key and a date', …);
  //   → JSON.stringify(gateway.entries) ne contient aucun id de question ni valeur de réponse
  it('should never reference quiz answers in the next step or next item suggestion', …);
});
```

Côté type, `Stamp` n'accepte aucune prop `color` (contrôlé à la relecture, et documenté dans
le JSDoc du composant).

---

## 12. Build en baby steps TDD

Ordre strict. Chaque étape suit le cycle rouge → vert → refactor. Les commits sur la branche de
feature sont en `build:`, et un seul `feat:` final porte le changelog. Modèles : **Sonnet** pour
`tdd`, `ui-designer` et `motion-designer` ; **Opus** pour `reviewer` et `evaluator`.

### Étape 1 — Registre de contenus lus (modèle pur)

Créer `models/reading-progress.model.ts`. Test : `__tests__/reading-progress.model.test.ts`

```
Feature: registre de contenus lus
  should build typed keys for guide, party, debate, election, quiz and stamp
  should reject malformed keys (missing type, uppercase, spaces, empty id)
  should keep only well-formed keys with valid ISO dates when sanitizing
  should keep well-formed keys of an unknown type when sanitizing
  should return an empty registry for non-object stored values
  should keep the earliest date when merging two registries
  should migrate legacy guide ids to guide:<id> keys dated now
  should ignore non-string legacy ids during migration
```

### Étape 2 — Horloge

Créer `gateways/clock.gateway.ts`, `system-clock.gateway.ts` et `fake-clock.gateway.ts`, puis
ajouter `clock` à `Dependencies`, `createTestStore` et `store/index.ts`. Pas de test dédié :
l'horloge est couverte par l'étape 5.

### Étape 3 — Gateway de progression (interface, fake, AsyncStorage)

Modifier `reading-progress.gateway.ts`, `fake-reading-progress.gateway.ts` et
`async-storage-reading-progress.gateway.ts` (storage et clock injectables). Test :
`__tests__/async-storage-reading-progress.gateway.test.ts` (stockage en mémoire)

```
Feature: stockage local de la progression
  should load an empty registry when nothing is stored
  should migrate guide.read-sections to progress.v1 and remove the legacy key
  should prefer progress.v1 when both keys exist and remove the legacy key
  should return an empty registry when stored JSON is corrupted
  should save the registry under progress.v1 as a flat key → ISO date object
  should remove both keys when clearing
  should not throw when the storage is unavailable
```

### Étape 4 — Slice `progress` + chargement

Remplacer `store/reading.slice.ts` par `store/progress.slice.ts`, mettre à jour `create-store.ts`,
ajouter les selectors et créer `store/state-builder.ts` (`stateBuilder().withCatalog(…).withEntries(…).withProgressStatus(…)`).
Créer aussi `models/catalog.factory.ts` (catalogue de test : guide minimal aux vrais ids,
3 partis non triés, 2 thèmes, 1 élection featured, 3 questions). Réécrire
`__tests__/reading-progress.test.ts`

```
Feature: chargement de la progression
  should be unknown before loading
  should restore the registry stored on this device and become ready
  should keep a content marked read before loading finished
  should silently award stamps for steps already complete at load, without celebration
```

### Étape 5 — Marquer un contenu lu

`markContentReadUsecase`. Tests dans `reading-progress.test.ts`

```
Feature: marquer un contenu comme lu
  should store the key with the ISO date of the clock
  should keep the first reading date when the same content is read again
  should not write to storage when the content is already read
  should not overwrite progress stored by another tab before saving
  should keep working in memory when storage fails
```

### Étape 6 — Définition du parcours

Créer `models/journey.model.ts`. Test : `__tests__/journey.service.test.ts` (partie « définition »)
et extension de `data-integrity.test.ts`

```
Feature: définition du parcours
  should define six steps in the advised order
  should put every party of the catalog in the parties step, in catalog order
  should put every theme in the debates step, in themes.json order
  should add the featured election to the presidential step
  should drop the election item when no election is featured
  should link a single-content step directly to its content
  should build canonical hrefs from content keys (/comprendre, /partis, /debats, /elections, /me-situer)
Feature: intégrité des données (ajout)
  should assign every guide section to exactly one journey step
  should only reference guide sections that exist
```

### Étape 7 — Calcul de progression

Créer `models/journey.service.ts`. Test : `__tests__/journey.service.test.ts`

```
Feature: progression du parcours
  should report zero progress and advise step 1 for a new visitor
  should advise the first step that is not done, in order
  should advise step 3 when steps 1, 2 and 4 are done (order is advised, not imposed)
  should mark the parties step done only with all parties read
  should never produce a locked status (every step has a status in todo | in-progress | done)
  should count stamps, not done steps, in stampedCount
  should keep a stamp when a new party is added and report 1 new item
  should give as next item the first unread one in step order
  should ignore read keys of contents that no longer exist
  should be finished when the six stamps are acquired
  should consider the quiz complete only when every question has an entry, null included
```

### Étape 8 — Tampons et célébrations

Ajouter `stampsToAward` et l'intégrer dans `markContentReadUsecase`, plus l'action
`celebrationsShown`. Tests dans `reading-progress.test.ts`

```
Feature: tampons du parcours
  should award the step stamp when its last content is read
  should queue the new stamp for celebration once
  should remove a celebration once it has been shown
  should not celebrate again a stamp already acquired
```

### Étape 9 — Effacer

`clearReadingProgressUsecase`

```
Feature: effacer ma progression
  should clear storage, registry and pending celebrations
  should leave the quiz answers in memory untouched
```

### Étape 10 — Questionnaire terminé

`markQuizDoneUsecase` + `quiz.view-model.showResults`. Étendre `__tests__/quiz.test.ts`

```
Feature: tampon « Me situer »
  should mark quiz:done when results are shown after answering every question
  should count "pas d'avis" answers as given
  should not mark quiz:done when results are shown early
  should keep quiz:done after the quiz is restarted
```

### Étape 11 — Vocabulaire

Créer `models/journey.copy.ts`. Test : `__tests__/journey.copy.test.ts`

```
Feature: libellés du parcours
  should describe a step not started with its total ("10 fiches", "3 lectures")
  should describe a step in progress as "4 sur 10 fiches"
  should use singular forms for one item
  should mention new items when a stamped step got new content
  should append the days left to the presidential step
  should build the full accessibility label of a node, with "étape conseillée"
  should say "Commencer" for an untouched step and "Continuer" otherwise
  should never use guilt or score vocabulary in any label
```

### Étape 12 — View-model de l'accueil

Créer `view-models/journey.view-model.ts` et supprimer `home.view-model.ts`. Test :
`__tests__/journey.view-model.test.ts`

```
Feature: accueil en parcours
  should render a neutral state before progress is loaded (no next, no cta, ratios at 0)
  should show the intro for a new visitor and the summary once a content is read
  should highlight the advised step with its call to action
  should expose the featured election news with days left
  should expose pending celebrations and clear them when shown
  should give every step a link, even at zero progress
```

### Étape 13 — View-model de la page d'étape

Créer `view-models/journey-step.view-model.ts`. Test : `__tests__/journey-step.view-model.test.ts`

```
Feature: page d'étape
  should list the step contents with "Fiche lue" / "À découvrir"
  should invite to read the remaining parties without reference to answers
  should suggest the next unread content in alphabetical order for parties
  should report an unknown step as not found
```

### Étape 14 — View-model du passeport

Créer `view-models/passport.view-model.ts`. Test : `__tests__/passport.view-model.test.ts`

```
Feature: passeport du citoyen
  should show six stamps, empty or stamped
  should show the final message only when the six stamps are acquired
  should list parties alphabetically with their read state
  should state that the quiz stamp never reflects the answers
```

### Étape 15 — Neutralité

Créer `__tests__/journey-neutrality.test.ts` (liste au § 11).

### Étape 16 — Marquage dans les view-models existants

Modifier `party.view-model.ts`, `theme.view-model.ts`, `elections.view-model.ts` et
`guide.view-model.ts`. Test : `__tests__/content-reading.test.ts`

```
Feature: marquage à la lecture
  should mark the party as read from the party view-model
  should mark the debate as read from the theme view-model
  should mark the election as read from the election view-model
  should mark the guide section with a guide: key
  should keep the guide list read states working (selectReadIds compat)
```

### Étape 17 — Fin de lecture

Créer `models/reach-end.service.ts` et ajouter la prop `onReachEnd` à `Page`. Test :
`__tests__/reach-end.service.test.ts`

```
Feature: fin de lecture
  should detect the end at 85 % of the content
  should consider a content that fits the viewport as read through
  should not trigger before 85 %
```

### Étape 18 — Composants (ui-designer, Sonnet)

Créer `Stamp`, `NodeMarker`, `NodeLabel`, `JourneyNode`, `JourneySegment`, `JourneyPath`,
`JourneyIntro`, `JourneySummary`, `JourneyHeader`, `JourneyArrival`, `NewsBanner`,
`PassportLink`, `PrivacyNote`, `ClearProgressSheet`, `StepHeader`, `StepInvite`, `StepItemRow`,
`PassportCover` et `StampGrid`. Le projet n'a pas de tests de rendu (Vitest, environnement
node) : on valide sur l'export web, en natif et à la relecture. Points d'accessibilité à
vérifier : `role="list"`/`listitem`, `aria-current="step"`, cibles ≥ 44 px, coche + texte.

### Étape 19 — Écrans et routes

Réécrire `HomeScreen`. Créer `JourneyStepScreen` + `app/parcours/[etape].tsx`
(`generateStaticParams`) et `PassportScreen` + `app/passeport.tsx`. Brancher `onReachEnd` dans
`PartyScreen`, `ThemeScreen` et `ElectionScreen`, et l'onglet Positions dans `PartyScreen`.
Faire attendre le catalogue au load dans `GlobalEffects`. Vérifier `npm run build:web` : les
pages `/parcours/*` et `/passeport` sont générées, sans erreur d'hydratation dans la console.

### Étape 20 — Animations (motion-designer, Sonnet) : voir § 13.

### Étape 21 — Documentation

- `docs/architecture-information.md` : l'accueil devient « Parcours citoyen + bandeau
  d'actualité » ; ajouter `/parcours/[etape]` et `/passeport`.
- `MethodologyScreen` : mention des données locales (§ 8.7).
- `CLAUDE.md`, section Produit : une ligne sur le parcours et la règle « mesurer la lecture,
  jamais les opinions ».

### Fichiers — récapitulatif

**À créer**

- `src/programmes/models/reading-progress.model.ts`
- `src/programmes/models/journey.model.ts`
- `src/programmes/models/journey.service.ts`
- `src/programmes/models/journey.copy.ts`
- `src/programmes/models/reach-end.service.ts`
- `src/programmes/models/catalog.factory.ts`
- `src/programmes/gateways/clock.gateway.ts`, `system-clock.gateway.ts`, `fake-clock.gateway.ts`
- `src/programmes/store/progress.slice.ts`, `src/programmes/store/state-builder.ts`
- `src/programmes/view-models/journey.view-model.ts`, `journey-step.view-model.ts`, `passport.view-model.ts`
- `src/programmes/screens/JourneyStepScreen.tsx`, `PassportScreen.tsx`
- `src/programmes/components/` : les 19 composants de l'étape 18
- `app/parcours/[etape].tsx`, `app/passeport.tsx`
- Tests : `reading-progress.model.test.ts`, `async-storage-reading-progress.gateway.test.ts`,
  `journey.service.test.ts`, `journey.copy.test.ts`, `journey.view-model.test.ts`,
  `journey-step.view-model.test.ts`, `passport.view-model.test.ts`,
  `journey-neutrality.test.ts`, `content-reading.test.ts`, `reach-end.service.test.ts`

**À modifier**

- `src/programmes/gateways/reading-progress.gateway.ts`, `fake-reading-progress.gateway.ts`, `async-storage-reading-progress.gateway.ts`
- `src/programmes/usecases/reading-progress.usecase.ts`
- `src/programmes/store/programmes.selector.ts`
- `src/core/store/create-store.ts`, `create-test-store.ts`, `index.ts`
- `src/core/screens/GlobalEffects.tsx`
- `src/programmes/view-models/guide.view-model.ts`, `party.view-model.ts`, `theme.view-model.ts`, `elections.view-model.ts`, `quiz.view-model.ts`
- `src/programmes/screens/HomeScreen.tsx`, `PartyScreen.tsx`, `ThemeScreen.tsx`, `ElectionScreen.tsx`, `MethodologyScreen.tsx`
- `src/programmes/components/Page.tsx` (prop `onReachEnd`), `Logo.tsx` (`LogoMark` : prop `reveal?` pour l'arrivée)
- `components/motion.ts` (tokens `trace`, `stamp`, `arrival`)
- `src/programmes/__tests__/reading-progress.test.ts` (réécrit), `quiz.test.ts`, `data-integrity.test.ts`
- `docs/architecture-information.md`
- (si l'alignement est validé) `src/programmes/models/presentation.service.ts` (`GUIDE_GROUPS` dérivé du parcours)

**À supprimer**

- `src/programmes/store/reading.slice.ts`
- `src/programmes/view-models/home.view-model.ts`

---

## 13. Brief micro-animations — pour `motion-designer`

Contraintes générales : tokens dans `components/motion.ts`, `useMotion()`, reanimated sur le
thread UI, rien en boucle, aucune pulsation, **jamais d'animation au premier rendu après
hydratation** (seulement pour `celebrations`), lecture seulement quand l'écran a le focus.
La séquence totale reste sous `duration.sequence` (1 200 ms).

Nouveaux tokens :

```ts
duration.trace = 300; // tronçon du chemin
duration.stamp = 220; // tampon qui se pose
duration.arrival = 160; // chaque demi-disque du logo (décalage 120 ms)
```

| Animation                       | Déclencheur                                                                                                              | Spécification                                                                                                                                                                                                                                                                                                                                                 | Mouvement réduit                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Remplissage d'arc d'un nœud** | Nouvelle valeur de `ratio` (retour sur l'accueil) ; au montage, de 0 à la valeur                                         | Déjà fourni par `Arc` : `duration.reveal` (550 ms), courbe `out`, de l'ancienne à la nouvelle valeur. Rien à ajouter                                                                                                                                                                                                                                          | Valeur finale immédiate (déjà géré)                                                                                                                                        |
| **Tronçon qui se trace**        | Une étape de `celebrations` passe `done` ; tronçon **sous** cette étape vers la suivante                                 | `strokeDashoffset` de la longueur du chemin vers 0, `duration.trace` (300 ms), courbe `out`, **après** l'arc (`withDelay(duration.reveal)`). Le pointillé est remplacé par le trait plein au début du tracé                                                                                                                                                   | Trait plein immédiat                                                                                                                                                       |
| **Le nœud suivant s'éclaire**   | Fin du tracé                                                                                                             | Bordure `surface.border` → `tint` et opacité 0,9 → 1, `duration.open` (220 ms), courbe `out`. Un seul passage, pas de halo animé                                                                                                                                                                                                                              | État final immédiat                                                                                                                                                        |
| **Tampon qui se pose**          | Étape dans `celebrations` : badge du nœud (accueil) **ou** tampon de couverture (passeport), selon l'écran vu en premier | `scale` 1,15 → 1, `rotate` −10° → −4° (rotation de repos de tous les tampons), `opacity` 0 → 1, `duration.stamp` (220 ms), courbe `out`, en même temps que le début du tracé (après l'arc). En natif, `Haptics.impactAsync(Light)` à la fin (`expo-haptics`, rien sur le web). Une seule fois : à la fin, appel de `onCelebrated([id])` → `celebrationsShown` | **Fondu simple** de 150 ms, sans échelle ni rotation. Ce fondu se joue même en mouvement réduit (`ReduceMotion.Never` explicite, durée fixe, pas `timing()` qui tombe à 0) |
| **Arrivée**                     | `finished` vient de passer à vrai (`me-situer` ou dernière étape dans `celebrations`)                                    | Les trois demi-disques de `LogoMark` (rouge, blanc, bleu, de l'extérieur vers l'intérieur) apparaissent l'un après l'autre : opacité 0 → 1 et échelle 0,9 → 1, `duration.arrival` chacun, décalage 120 ms. Une seule fois                                                                                                                                     | Logo plein immédiat                                                                                                                                                        |
| **Hydratation**                 | `status` passe à `ready`                                                                                                 | Pastille CTA, mise en évidence du nœud suivant et passage intro → résumé dans `JourneyHeader` : fondu `duration.page` (240 ms). Les arcs se remplissent normalement. **Ni tampon, ni tracé**                                                                                                                                                                  | Immédiat                                                                                                                                                                   |

Séquence type (dernière fiche d'une étape lue, retour sur l'accueil) :
`0 ms` arc du nœud 550 ms → `550 ms` tronçon 300 ms ‖ tampon 220 ms → `850 ms` nœud suivant
220 ms → fin à **1 070 ms**.

---

## 14. Décisions qui méritent l'avis de l'utilisateur

1. **Aligner `GUIDE_GROUPS` sur le parcours** (recommandé). Aujourd'hui, la page Comprendre et le
   parcours rangent les sections différemment (« Les bases » n'y contient pas les mêmes
   sections). Recommandation : une seule taxonomie, dérivée du parcours.
2. **Règle « lu » de la page élection** : fin de lecture (85 %) au lieu de « page ouverte »
   (maquette). Avantage : une seule règle. Inconvénient : il faut défiler un peu sur mobile.
3. **Fiche parti « lue » dès la fin de n'importe quel onglet** (y compris « En bref », court) ou
   à l'ouverture de « Positions ». C'est la lecture la plus simple de la maquette. Une variante
   plus exigeante (« Positions » obligatoire) pousserait davantage au fond, mais c'est plus
   lourd.
4. **Tampon « Me situer » seulement si toutes les questions ont une réponse** (« pas d'avis »
   compris). « Voir mes résultats » avant la fin ne le donne pas.
5. **Chaînes en français codées en dur** (comme tout `src/programmes/` aujourd'hui), mais
   centralisées dans `journey.copy.ts`. Cela s'écarte de la règle i18n de `CLAUDE.md`, qui n'est
   appliquée nulle part. À trancher pour tout le site, pas seulement pour cette feature.
6. **`/passeport` en `noindex`** (sa page statique n'a pas de sens sans progression). Les pages
   `/parcours/[etape]` restent indexables.
