import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/apis/authApi";
import { queryKeys } from "@/lib/queryKeys";

export function useAuthMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.getProfile(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}
