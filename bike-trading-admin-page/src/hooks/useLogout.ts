import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Logout: xóa token (Zustand) + xóa cache React Query (Bài 08/09 — tránh lộ data user trước).
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  return useCallback(() => {
    clearTokens();
    queryClient.removeQueries();
    navigate("/", { replace: true });
  }, [clearTokens, navigate, queryClient]);
}
