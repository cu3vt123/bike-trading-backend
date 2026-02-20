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

export type SignupRequest = {
  role: "BUYER" | "SELLER";
  username: string;
  email?: string;
  password: string;
};

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data).then((r) => r.data),
  signup: (data: SignupRequest) =>
    apiClient.post<LoginResponse>("/auth/signup", data).then((r) => r.data),
  getProfile: () => apiClient.get("/auth/me").then((r) => r.data),
};
