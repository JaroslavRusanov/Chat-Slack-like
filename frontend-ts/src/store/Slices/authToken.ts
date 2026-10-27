import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { TokenState } from '../types'

const initialState: TokenState = {
  token: localStorage.getItem('token'),
}

const tokenSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
    },
  },
})

export const { setToken } = tokenSlice.actions

export const tokenSelector = (state: RootState): string | null => state.auth.token

export default tokenSlice.reducer
