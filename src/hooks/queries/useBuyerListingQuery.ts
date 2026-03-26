import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { fetchListingById } from "@/services/buyerService";

export function useBuyerListingQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.listingBuyer(id ?? "_"),
    queryFn: () => fetchListingById(id!),
    enabled: Boolean(id),
  });
}
