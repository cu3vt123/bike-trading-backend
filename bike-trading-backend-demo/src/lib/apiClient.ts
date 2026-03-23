import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { API_BASE_URL, API_TIMEOUT } from "./apiConfig";

/**
 * HTTP client dùng cho toàn app.
 * - Request: gắn Bearer từ Zustand.
 * - Response: 401 → clearTokens (session hết hạn / token lỗi).
 * Khi BE có refresh token: thêm interceptor retry + POST /auth/refresh (xem docs/PRODUCTION-HARDENING.md).
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 – clear tokens (session expired / invalid)
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
