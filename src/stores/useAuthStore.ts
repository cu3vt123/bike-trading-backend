import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  setTokens: (payload: {
    accessToken: string;
    refreshToken?: string;
    role: Role;
  }) => void;
  clearTokens: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,

      setTokens: ({ accessToken, refreshToken, role }) =>
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          role,
        }),

      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, role: null }),
    }),
    { name: "auth-storage" },
  ),
);
