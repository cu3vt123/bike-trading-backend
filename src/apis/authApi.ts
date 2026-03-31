import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Role } from "@/types/auth";
import type { SellerSubscriptionSummary } from "@/stores/useSellerSubscriptionStore";

export type LoginRequest = {
  emailOrUsername: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  role?: Role;
  subscription?: SellerSubscriptionSummary;
};

export type MeResponse = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  subscription?: SellerSubscriptionSummary;
};

export type SignupRequest = {
  role: "BUYER" | "SELLER";
  username?: string;
  email: string;
  password: string;
};

export type ForgotPasswordResponse = { message?: string };
export type ResetPasswordRequest = { token: string; newPassword: string };

/** Backend có thể trả trực tiếp payload hoặc bọc `{ data: T }`. */
type MaybeWrapped<T> = T | { data: T };

function unwrapAuthBody<T>(body: MaybeWrapped<T>): T {
  if (body !== null && typeof body === "object" && "data" in body) {
    const inner = (body as { data: T }).data;
    if (inner !== undefined) return inner;
  }
  return body as T;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient
      .post<MaybeWrapped<LoginResponse>>(API_PATHS.AUTH.LOGIN, data)
      .then((r) => unwrapAuthBody(r.data)),
  signup: (data: SignupRequest) =>
    apiClient
      .post<MaybeWrapped<LoginResponse>>(API_PATHS.AUTH.SIGNUP, data)
      .then((r) => unwrapAuthBody(r.data)),
  getProfile: () =>
    apiClient
      .get<MaybeWrapped<MeResponse>>(API_PATHS.AUTH.ME)
      .then((r) => unwrapAuthBody(r.data)),
  forgotPassword: (email: string) =>
    apiClient
      .post<MaybeWrapped<ForgotPasswordResponse>>(
        API_PATHS.AUTH.FORGOT_PASSWORD,
        { email },
      )
      .then((r) => unwrapAuthBody(r.data)),
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient
      .post<MaybeWrapped<ForgotPasswordResponse>>(
        API_PATHS.AUTH.RESET_PASSWORD,
        data,
      )
      .then((r) => unwrapAuthBody(r.data)),
};
