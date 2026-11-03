import { createAppAsyncThunk } from '@/src/core/store/create-app-thunk';

export const loadCatalogUsecase = createAppAsyncThunk(
  'programmes/loadCatalog',
  async (_, { extra }) => extra.programmeGateway.loadCatalog(),
  { condition: (_, { getState }) => getState().programmes.status === 'idle' }
);
