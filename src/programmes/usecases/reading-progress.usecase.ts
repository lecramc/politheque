import { createAppAsyncThunk } from '@/src/core/store/create-app-thunk';
import { isQuizComplete, stampsToAward, withStamps } from '@/src/programmes/models/journey.service';
import {
  contentKey,
  mergeEntries,
  type ContentKey,
} from '@/src/programmes/models/reading-progress.model';
import { selectJourney } from '@/src/programmes/store/programmes.selector';

export const loadReadingProgressUsecase = createAppAsyncThunk(
  'progress/load',
  async (_, { extra: { readingProgressGateway, clock }, getState }) => {
    const stored = await readingProgressGateway.load();
    // Un contenu marqué avant la fin du chargement ne doit pas être perdu.
    const merged = mergeEntries(stored, getState().progress.entries);
    // Tampons « silencieux » : étapes déjà complètes (migration, contenus déjà lus).
    const awarded = withStamps(
      merged,
      stampsToAward(selectJourney(getState()), merged),
      clock.now().toISOString()
    );
    // Merge et tampons ne font qu'ajouter des clés : un écart de taille signale un changement.
    if (Object.keys(awarded).length !== Object.keys(stored).length) {
      await readingProgressGateway.save(awarded);
    }
    return awarded;
  }
);

export const markContentReadUsecase = createAppAsyncThunk(
  'progress/markRead',
  async (key: ContentKey, { extra: { readingProgressGateway, clock }, getState }) => {
    // Relire le stockage avant d'écrire : on n'écrase ni une progression pas encore chargée,
    // ni celle d'un autre onglet web.
    const stored = await readingProgressGateway.load();
    const base = mergeEntries(stored, getState().progress.entries);
    if (key in base) return { entries: base, newStamps: [] };
    const now = clock.now().toISOString();
    const withKey = { ...base, [key]: now };
    const newStamps = stampsToAward(selectJourney(getState()), withKey);
    const entries = withStamps(withKey, newStamps, now);
    await readingProgressGateway.save(entries);
    return { entries, newStamps };
  },
  { condition: (key, { getState }) => !(key in getState().progress.entries) }
);

export const clearReadingProgressUsecase = createAppAsyncThunk(
  'progress/clear',
  async (_, { extra: { readingProgressGateway } }) => {
    await readingProgressGateway.clear();
  }
);

/** Tampon « Me situer » : seulement si chaque question a une entrée (« pas d'avis » compris). */
export const markQuizDoneUsecase = createAppAsyncThunk(
  'progress/markQuizDone',
  async (_, { getState, dispatch }) => {
    const { quiz, programmes } = getState();
    if (!isQuizComplete(programmes.catalog?.questions ?? [], quiz.values)) return;
    await dispatch(markContentReadUsecase(contentKey.quizDone));
  }
);
