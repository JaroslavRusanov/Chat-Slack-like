/* eslint-disable no-param-reassign */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const tokenAdapter = createEntityAdapter();
const initialState = tokenAdapter.getInitialState({
  token: localStorage.getItem('token'),
});

const tokenSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const { setToken } = tokenSlice.actions;
export const tokenSelector = (state) => state.auth.token;
export default tokenSlice.reducer;
