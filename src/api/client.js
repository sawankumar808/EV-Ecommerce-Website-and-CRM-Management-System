import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  // Check for 'access_token', 'token', or 'access'
  const token = 
    localStorage.getItem("access_token") || 
    localStorage.getItem("token") || 
    localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response && error.response.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;