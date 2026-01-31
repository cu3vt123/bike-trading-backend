import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auto logout on 401 (optional but recommended)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().clearTokens();
    }
    return Promise.reject(err);
  },
);

export default apiClient;
