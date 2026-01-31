import apiClient from "@/lib/apiClient";
import type { Role } from "@/types/auth";

export type LoginRequest = {
  role: Role;
  emailOrUsername: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/api/auth/login", data).then((r) => r.data),
  getProfile: () => apiClient.get("/api/auth/me").then((r) => r.data),
};
