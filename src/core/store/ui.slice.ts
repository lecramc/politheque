import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UiState = {
  tabBarHidden: boolean;
};

const initialState: UiState = {
  tabBarHidden: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTabBarHidden(state, action: PayloadAction<boolean>) {
      state.tabBarHidden = action.payload;
    },
  },
});

export const { setTabBarHidden } = uiSlice.actions;
