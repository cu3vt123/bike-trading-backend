import { useQuery } from "@tanstack/react-query";

import { fetchListings } from "@/services/buyerService";
import { queryKeys } from "@/lib/queryKeys";

export function useListingsQuery() {
  return useQuery({
    queryKey: queryKeys.listings,
    queryFn: () => fetchListings(),
  });
}
