import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { fetchListingDetailForPage } from "@/services/listingDetailService";
import type { Role } from "@/types/auth";
import type { BikeDetail } from "@/types/shopbike";

export function useListingDetailQuery(
  id: string | undefined,
  role: Role | null,
  options?: { fromStateListing?: BikeDetail | null },
) {
  const stateMatch = Boolean(
    options?.fromStateListing &&
      id &&
      String(options.fromStateListing.id) === String(id),
  );

  const q = useQuery({
    queryKey: queryKeys.listingDetail(id ?? "_", role),
    queryFn: () => fetchListingDetailForPage(id!, role),
    enabled: Boolean(id) && !stateMatch,
  });

  const listing =
    stateMatch && options?.fromStateListing
      ? options.fromStateListing
      : (q.data ?? null);

  const loading = stateMatch ? false : q.isPending;
  const error = stateMatch
    ? null
    : q.isError
      ? q.error instanceof Error
        ? q.error.message
        : "Error"
      : null;

  return { listing, loading, error, refetch: q.refetch, isError: q.isError };
}
