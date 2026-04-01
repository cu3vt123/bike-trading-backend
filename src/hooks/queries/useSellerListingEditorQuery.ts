import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { fetchListingById } from "@/services/sellerService";

export function useSellerListingEditorQuery(listingId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.seller.listing(listingId ?? "_"),
    queryFn: () => fetchListingById(listingId!),
    enabled: Boolean(listingId),
  });
}
