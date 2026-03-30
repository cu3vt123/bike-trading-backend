import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { API_BASE_URL, API_PATHS, API_TIMEOUT } from "./apiConfig";

/**
 * HTTP client — kat-minh/react Bài 04 + 09:
 * - Request: Bearer từ Zustand.
 * - 401: thử POST /auth/refresh (nếu có refreshToken), retry 1 lần; không thì clearTokens.
 * Refresh gọi bằng axios thuần (tránh vòng interceptor).
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function isAuthPublicPath(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes(API_PATHS.AUTH.LOGIN) ||
    url.includes(API_PATHS.AUTH.SIGNUP) ||
    url.includes(API_PATHS.AUTH.REFRESH) ||
    url.includes(API_PATHS.AUTH.FORGOT_PASSWORD) ||
    url.includes(API_PATHS.AUTH.RESET_PASSWORD)
  );
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status !== 401 || !original) {
      return Promise.reject(err);
    }

    const url = String(original.url ?? "");
    if (original._retry) {
      useAuthStore.getState().clearTokens();
      return Promise.reject(err);
    }
    if (isAuthPublicPath(url)) {
      useAuthStore.getState().clearTokens();
      return Promise.reject(err);
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    const role = useAuthStore.getState().role;
    if (!refreshToken || !role) {
      useAuthStore.getState().clearTokens();
      return Promise.reject(err);
    }

    try {
      const { data } = await axios.post<unknown>(
        `${API_BASE_URL}${API_PATHS.AUTH.REFRESH}`,
        { refreshToken },
        {
          timeout: API_TIMEOUT,
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      const payload = (data as { data?: Record<string, unknown> }).data ?? data;
      const accessToken = (payload as { accessToken?: string }).accessToken;
      const newRefresh =
        (payload as { refreshToken?: string }).refreshToken ?? refreshToken;
      if (!accessToken) {
        useAuthStore.getState().clearTokens();
        return Promise.reject(err);
      }
      useAuthStore.getState().setTokens({
        accessToken,
        refreshToken: newRefresh,
        role,
      });
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      original._retry = true;
      return apiClient(original);
    } catch {
      useAuthStore.getState().clearTokens();
      return Promise.reject(err);
    }
  },
);

export default apiClient;
