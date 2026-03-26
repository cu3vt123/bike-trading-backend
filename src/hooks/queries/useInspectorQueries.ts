import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchPendingListings,
  fetchWarehouseReInspectionListings,
} from "@/services/inspectorService";
import { fetchReInspectionOrders } from "@/services/adminService";

export function useInspectorPendingQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.pending,
    queryFn: fetchPendingListings,
  });
}

export function useInspectorReInspectionQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.reInspection,
    queryFn: fetchReInspectionOrders,
  });
}

export function useInspectorWarehouseReQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.warehouseRe,
    queryFn: fetchWarehouseReInspectionListings,
  });
}
