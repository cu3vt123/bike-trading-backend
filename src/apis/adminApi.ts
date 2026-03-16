import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Order } from "@/types/order";
import type { Listing } from "@/types/shopbike";
import type { Role } from "@/types/auth";

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

export type AdminUser = {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
  isHidden?: boolean;
  hiddenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

  getUsers: (): Promise<AdminUser[]> =>
    apiClient
      .get(API_PATHS.ADMIN.USERS)
      .then((r) => r.data?.data ?? r.data ?? []),

  hideUser: (id: string): Promise<AdminUser> =>
    apiClient
      .put(API_PATHS.ADMIN.HIDE_USER(id))
      .then((r) => r.data?.data ?? r.data),

  unhideUser: (id: string): Promise<AdminUser> =>
    apiClient
      .put(API_PATHS.ADMIN.UNHIDE_USER(id))
      .then((r) => r.data?.data ?? r.data),

  getListings: (): Promise<Listing[]> =>
    apiClient
      .get(API_PATHS.ADMIN.LISTINGS)
      .then((r) => r.data?.data ?? r.data ?? []),

  hideListing: (id: string): Promise<Listing> =>
    apiClient
      .put(API_PATHS.ADMIN.HIDE_LISTING(id))
      .then((r) => r.data?.data ?? r.data),

  unhideListing: (id: string): Promise<Listing> =>
    apiClient
      .put(API_PATHS.ADMIN.UNHIDE_LISTING(id))
      .then((r) => r.data?.data ?? r.data),

  getBrands: (): Promise<{ id: string; name: string; slug?: string; active?: boolean }[]> =>
    apiClient
      .get(API_PATHS.ADMIN.BRANDS)
      .then((r) => r.data?.data ?? r.data ?? []),

  createBrand: (data: { name: string; slug?: string }): Promise<{ id: string; name: string; slug?: string }> =>
    apiClient
      .post(API_PATHS.ADMIN.BRANDS, data)
      .then((r) => r.data?.data ?? r.data),

  updateBrand: (id: string, data: { name?: string; slug?: string; active?: boolean }): Promise<{ id: string; name: string; slug?: string; active?: boolean }> =>
    apiClient
      .put(API_PATHS.ADMIN.BRAND_BY_ID(id), data)
      .then((r) => r.data?.data ?? r.data),

  deleteBrand: (id: string): Promise<{ deleted: boolean; id: string }> =>
    apiClient
      .delete(API_PATHS.ADMIN.BRAND_BY_ID(id))
      .then((r) => r.data?.data ?? r.data),
};

