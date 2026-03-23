import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/auth";
import { useSellerSubscriptionStore } from "@/stores/useSellerSubscriptionStore";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  /** Bằng true sau khi persist đã rehydrate từ localStorage (tránh guard đọc role cũ → 403) */
  _hasHydrated: boolean;
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
      _hasHydrated: false,

      setTokens: ({ accessToken, refreshToken, role }) =>
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          role,
        }),

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, role: null });
        useSellerSubscriptionStore.getState().clear();
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth-storage");
          } catch {}
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
      }),
      onRehydrateStorage: () => (state, err) => {
        useAuthStore.setState({ _hasHydrated: true });
      },
      // Fallback: nếu onRehydrateStorage chậm/không chạy (ví dụ Strict Mode), vẫn mở khóa guard sau 300ms
      skipHydration: false,
    },
  ),
);

// Fallback: nếu persist rehydrate chậm hoặc không chạy, vẫn mở khóa guard sau 300ms để tránh treo spinner
if (typeof window !== "undefined") {
  setTimeout(() => {
    if (!useAuthStore.getState()._hasHydrated) {
      useAuthStore.setState({ _hasHydrated: true });
    }
  }, 300);
}
