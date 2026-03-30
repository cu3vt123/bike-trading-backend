import { useQueries } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchSellerDashboard,
  fetchSellerDashboardOrders,
  fetchSellerRatings,
} from "@/services/sellerService";

export function useSellerDashboardQueries() {
  const [dashQ, ordersQ, ratingsQ] = useQueries({
    queries: [
      {
        queryKey: queryKeys.seller.dashboard,
        queryFn: fetchSellerDashboard,
      },
      {
        queryKey: queryKeys.seller.orders,
        queryFn: fetchSellerDashboardOrders,
      },
      {
        queryKey: queryKeys.seller.ratings,
        queryFn: fetchSellerRatings,
      },
    ],
  });

  const loading = dashQ.isPending || ordersQ.isPending || ratingsQ.isPending;
  const stats = dashQ.data?.stats ?? {
    total: 0,
    published: 0,
    inReview: 0,
    needUpdate: 0,
  };
  const listings = dashQ.data?.listings ?? [];
  const orders = ordersQ.data ?? [];
  const ratings = ratingsQ.data ?? null;

  return {
    loading,
    stats,
    listings,
    orders,
    ratings,
    refetchAll: () =>
      Promise.all([dashQ.refetch(), ordersQ.refetch(), ratingsQ.refetch()]),
  };
}
