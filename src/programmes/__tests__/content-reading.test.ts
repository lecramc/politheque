import { createTestStore } from '@/src/core/store/create-test-store';
import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { selectReadIds } from '@/src/programmes/store/programmes.selector';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { electionViewModel } from '@/src/programmes/view-models/elections.view-model';
import {
  guideSectionViewModel,
  guideViewModel,
} from '@/src/programmes/view-models/guide.view-model';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

const setup = () => {
  const store = createTestStore({
    initialState: stateBuilder().withCatalog(catalogFactory()).build(),
  });
  return { store, dispatch: store.dispatch };
};
const entriesOf = (store: ReturnType<typeof setup>['store']) =>
  Object.keys(store.getState().progress.entries);

describe('Feature: marquage à la lecture', () => {
  it('should mark the party as read from the party view-model', async () => {
    const { store, dispatch } = setup();
    await partyViewModel('alpha')({ dispatch })(store.getState()).markRead();
    expect(entriesOf(store)).toEqual(['party:alpha']);
  });

  it('should mark the debate as read from the theme view-model', async () => {
    const { store, dispatch } = setup();
    await themeViewModel('economie')({ dispatch })(store.getState()).markRead();
    expect(entriesOf(store)).toEqual(['debate:economie']);
  });

  it('should mark the election as read from the election view-model', async () => {
    const { store, dispatch } = setup();
    await electionViewModel('presidentielle-2027')({ dispatch })(store.getState()).markRead();
    expect(entriesOf(store)).toEqual(['election:presidentielle-2027']);
  });

  it('should mark the guide section with a guide: key', async () => {
    const { store, dispatch } = setup();
    await guideSectionViewModel('institutions')({ dispatch })(store.getState()).markRead();
    expect(entriesOf(store)).toEqual(['guide:institutions']);
  });

  it('should keep the guide list read states working (selectReadIds compat)', async () => {
    const { store, dispatch } = setup();
    await guideSectionViewModel('institutions')({ dispatch })(store.getState()).markRead();
    await partyViewModel('alpha')({ dispatch })(store.getState()).markRead();
    expect(selectReadIds(store.getState())).toEqual(['institutions']);
    const rows = guideViewModel()(store.getState()).groups.flatMap((g) => g.rows);
    expect(rows.find((r) => r.section.id === 'institutions')?.read).toBe(true);
    expect(rows.find((r) => r.section.id === 'comment-voter')?.read).toBe(false);
  });
});
