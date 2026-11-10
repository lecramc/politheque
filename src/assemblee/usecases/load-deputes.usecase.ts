import { createAppAsyncThunk } from '@/src/core/store/create-app-thunk';
import { isFailure } from '@/src/helpers/either.type';
import { tryCatch } from '@/src/helpers/trycatch';

/** Annuaire des députés, chargé une seule fois (partagé par tous les scrutins). */
export const loadDeputesUsecase = createAppAsyncThunk(
  'assemblee/loadDeputes',
  async (_, { extra, rejectWithValue }) => {
    const response = await tryCatch(extra.assembleeGateway.loadDeputes());
    if (isFailure(response)) return rejectWithValue(response.reason);
    return response.value;
  },
  {
    condition: (_, { getState }) => {
      const status = getState().assemblee.deputes.status;
      return status !== 'loading' && status !== 'loaded';
    },
  }
);
