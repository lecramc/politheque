import { createAppAsyncThunk } from '@/src/core/store/create-app-thunk';

export const loadReadingProgressUsecase = createAppAsyncThunk(
  'reading/load',
  async (_, { extra }) => extra.readingProgressGateway.load()
);

export const markSectionReadUsecase = createAppAsyncThunk(
  'reading/markRead',
  async (sectionId: string, { extra, getState }) => {
    const read = getState().reading.readIds;
    if (read.includes(sectionId)) return read;
    const next = [...read, sectionId];
    await extra.readingProgressGateway.save(next);
    return next;
  }
);
