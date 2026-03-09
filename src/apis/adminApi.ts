import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Order } from "@/types/order";
import type { Listing } from "@/types/shopbike";

export type OrderWithListing = Order & { listing?: Listing };

export type AdminStats = {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalListings: number;
  totalOrders: number;
  ordersPendingWarehouse: number;
  ordersReInspection: number;
};

export const adminApi = {
  getWarehouseOrders: (): Promise<OrderWithListing[]> =>
    apiClient
      .get(API_PATHS.ADMIN.WAREHOUSE_ORDERS)
      .then((r) => r.data?.data ?? r.data ?? []),

  confirmWarehouseArrival: (orderId: string): Promise<Order> =>
    apiClient
      .put(API_PATHS.ADMIN.CONFIRM_WAREHOUSE(orderId))
      .then((r) => r.data?.data ?? r.data),

  getReInspectionOrders: (): Promise<OrderWithListing[]> =>
    apiClient
      .get(API_PATHS.ADMIN.RE_INSPECTION_ORDERS)
      .then((r) => r.data?.data ?? r.data ?? []),

  submitReInspectionDone: (orderId: string): Promise<Order> =>
    apiClient
      .put(API_PATHS.ADMIN.RE_INSPECTION_DONE(orderId))
      .then((r) => r.data?.data ?? r.data),

  getStats: (): Promise<AdminStats> =>
    apiClient
      .get(API_PATHS.ADMIN.STATS)
      .then((r) => r.data?.data ?? r.data),
};

