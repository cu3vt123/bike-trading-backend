import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

import { authApi, type LoginRequest, type SignupRequest } from "@/apis/authApi";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
} from "@/stores/useSellerSubscriptionStore";
import type { Role } from "@/types/auth";
import {
  mockLogin,
  mockSignup,
  resolvePostLoginPath,
  USE_MOCK_AUTH,
} from "@/lib/authLoginHelpers";

type LocationState = {
  from?: { pathname?: string; search?: string };
};

export function useLoginMutation() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const setSellerSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  const state = (location.state || {}) as LocationState;
  const fromPath = useMemo(() => {
    const p = state.from?.pathname;
    if (!p || p === "/login") return "/";
    const search = state.from?.search ?? "";
    return `${p}${search}`;
  }, [state.from?.pathname, state.from?.search]);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      if (USE_MOCK_AUTH) return mockLogin(payload);
      return authApi.login(payload);
    },
    onSuccess: (res) => {
      const resolvedRole = (res as { role?: Role }).role ?? "BUYER";
      clearTokens();
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role: resolvedRole,
      });
      const sub = normalizeSubscriptionPayload(
        (res as { subscription?: unknown }).subscription,
      );
      if (resolvedRole === "SELLER") {
        setSellerSubscription(sub);
      }
      queryClient.invalidateQueries();
      const target = resolvePostLoginPath(fromPath, resolvedRole);
      queueMicrotask(() => navigate(target, { replace: true }));
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const setSellerSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  return useMutation({
    mutationFn: async (payload: SignupRequest) => {
      if (USE_MOCK_AUTH) {
        return mockSignup({
          role: payload.role as Role,
          username: payload.username ?? "",
          email: payload.email,
          password: payload.password,
        });
      }
      return authApi.signup(payload);
    },
    onSuccess: (res, variables) => {
      const resolvedRole = (res as { role?: Role }).role ?? variables.role;
      clearTokens();
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role: resolvedRole,
      });
      const sub = normalizeSubscriptionPayload(
        (res as { subscription?: unknown }).subscription,
      );
      if (resolvedRole === "SELLER") {
        setSellerSubscription(sub);
      }
      queryClient.invalidateQueries();
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.buyer.orders });
      navigate("/", { replace: true });
    },
  });
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return;
      }
      await authApi.forgotPassword(email);
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        return;
      }
      await authApi.resetPassword(payload);
    },
  });
}
