import { useQueries } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { fetchListingById } from "@/services/buyerService";

export function useWishlistListingsQuery(ids: string[]) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.listingBuyer(id),
      queryFn: () => fetchListingById(id),
      enabled: ids.length > 0,
    })),
  });

  const loading = results.some((r) => r.isPending);
  const listings = results
    .map((r) => r.data)
    .filter((x): x is NonNullable<typeof x> => x != null);

  return { listings, loading, results };
}
