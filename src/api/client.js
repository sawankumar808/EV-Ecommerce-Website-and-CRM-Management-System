import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
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
    // Agar user public pages par hai (jaise /, /products, /about, /contact), toh 401 aane par login par mat bhejo
    const publicPaths = ["/", "/about", "/products", "/contact", "/login", "/vendor/register"];
    const isPublicPage = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith("/products/");

    if (error.response && error.response.status === 401 && !isPublicPage) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;