import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query — khớp kat-minh/react (07/08): cache server state, mutation + invalidate.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
