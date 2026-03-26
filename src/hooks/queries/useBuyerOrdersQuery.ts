import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { fetchMyOrders } from "@/services/buyerService";

export function useBuyerOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.buyer.orders,
    queryFn: () => fetchMyOrders(),
  });
}
