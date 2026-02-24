import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user_id: null,
  role: null,
  isAuthenticated: false,
  authChecked: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user_id, role } = action.payload;

      state.user_id = user_id;
      state.role = role;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      return initialState;
    },

    authCheckComplete: (state) => {
      state.authChecked = true;
    },
  },
});

export const { loginSuccess, logout, authCheckComplete } =
  userSlice.actions;

export default userSlice.reducer;