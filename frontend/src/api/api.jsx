import axios from "axios";
import { store } from "../redux/store";
import { updateAccessToken, logout } from "../redux/userReducer";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});


api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);



async function refreshToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}accounts/token/refresh/`,
      {},
      { withCredentials: true }
    );

    const newAccessToken = response.data.access_token;

   
    store.dispatch(updateAccessToken(newAccessToken));

    return newAccessToken;
  } catch (error) {
    store.dispatch(logout());
    window.location.href = "/login";
    return null;
  }
}


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
