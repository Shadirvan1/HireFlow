

import axios from "axios";

const BASE_URL = import.meta.env.VITE_LIVE_SERVICE_URL;

const LiveApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default LiveApi;