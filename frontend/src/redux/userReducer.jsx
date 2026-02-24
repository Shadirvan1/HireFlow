import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user_id: null,
  role: null,
  access_token: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user_id, role, access_token } = action.payload;

      state.user_id = user_id;
      state.role = role;
      state.access_token = access_token;
      state.isAuthenticated = true;

      localStorage.setItem("auth", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user_id = null;
      state.role = null;
      state.access_token = null;
      state.isAuthenticated = false;

      localStorage.clear();
    },

    loadUserFromStorage: (state) => {
      const data = localStorage.getItem("auth");
      if (data) {
        const parsed = JSON.parse(data);
        state.user_id = parsed.user_id;
        state.role = parsed.role;
        state.access_token = parsed.access_token;
        state.isAuthenticated = true;
      }
    },

    updateAccessToken: (state, action) => {
      state.access_token = action.payload;

      const stored = JSON.parse(localStorage.getItem("auth"));
      if (stored) {
        stored.access_token = action.payload;
        localStorage.setItem("auth", JSON.stringify(stored));
      }
    },
  },
});

export const {
  loginSuccess,
  logout,
  loadUserFromStorage,
  updateAccessToken, 
} = userSlice.actions;

export default userSlice.reducer;