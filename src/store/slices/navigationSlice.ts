import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '..';

interface NavigationState {
  path: string
}

const initialState: NavigationState = {
  path: ''
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    addItemPath(state, action) {
      state.path = action.payload;
    },
    removeItemPath(state, action) {
      state.path = state.path.substring(0, state.path.lastIndexOf('/'));
    }
  }
});

export const { addItemPath, removeItemPath } = navigationSlice.actions;
export const path = (state: RootState) => state.navigation.path;

export default navigationSlice.reducer;