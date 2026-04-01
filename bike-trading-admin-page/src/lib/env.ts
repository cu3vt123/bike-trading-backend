/**
 * Environment variables – ShopBike Frontend
 * Fail-fast: thiếu env → crash khi start
 */
const API_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8081/api";
const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API as string) === "true";

export const env = {
  API_URL,
  USE_MOCK_API: USE_MOCK,
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
} as const;
