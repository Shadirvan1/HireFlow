import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});


async function refreshToken() {
  try {
    await axios.post(
      `${BASE_URL}accounts/token/refresh/`,
      {}, 
      { withCredentials: true }
    );

    return true;
  } catch (err) {
    console.error("Refresh token failed:", err);
    localStorage.clear()
    window.location.href = "/login"; 
    return false;
  }
}


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshed = await refreshToken();
      if (refreshed) {
       
        return api.request(originalRequest);
      } else {

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;