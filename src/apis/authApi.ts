import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Role } from "@/types/auth";

export type LoginRequest = {
  emailOrUsername: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  role?: Role;
};

export type SignupRequest = {
  role: "BUYER" | "SELLER";
  username?: string;
  email: string;
  password: string;
};

export type ForgotPasswordResponse = { message?: string };
export type ResetPasswordRequest = { token: string; newPassword: string };

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient
      .post<LoginResponse>(API_PATHS.AUTH.LOGIN, data)
      .then((r) => r.data?.data ?? r.data),
  signup: (data: SignupRequest) =>
    apiClient
      .post<LoginResponse>(API_PATHS.AUTH.SIGNUP, data)
      .then((r) => r.data?.data ?? r.data),
  getProfile: () =>
    apiClient.get(API_PATHS.AUTH.ME).then((r) => r.data?.data ?? r.data),
  forgotPassword: (email: string) =>
    apiClient
      .post<ForgotPasswordResponse>(API_PATHS.AUTH.FORGOT_PASSWORD, { email })
      .then((r) => r.data?.data ?? r.data),
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient
      .post<ForgotPasswordResponse>(API_PATHS.AUTH.RESET_PASSWORD, data)
      .then((r) => r.data?.data ?? r.data),
};
