import axios from "axios";
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api", timeout: 20000 });
api.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (typeof window !== "undefined" && error.response?.status === 401 && !["/auth/login", "/auth/register"].some(path => error.config?.url?.endsWith(path))) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("carikos:unauthorized"));
    if (!window.location.pathname.startsWith("/auth/")) window.location.replace("/auth/login");
  }
  return Promise.reject(error);
});
export default api;
