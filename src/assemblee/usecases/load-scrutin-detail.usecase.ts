import { createAppAsyncThunk } from '@/src/core/store/create-app-thunk';
import { isFailure } from '@/src/helpers/either.type';
import { tryCatch } from '@/src/helpers/trycatch';

/** Détail nominatif d'un scrutin, chargé à l'ouverture de sa page, une seule fois par scrutin. */
export const loadScrutinDetailUsecase = createAppAsyncThunk(
  'assemblee/loadScrutinDetail',
  async (numero: number, { extra, rejectWithValue }) => {
    const response = await tryCatch(extra.assembleeGateway.loadScrutinDetail(numero));
    if (isFailure(response)) return rejectWithValue(response.reason);
    return response.value;
  },
  {
    condition: (numero, { getState }) => {
      const status = getState().assemblee.details[numero]?.status;
      return status !== 'loading' && status !== 'loaded';
    },
  }
);
