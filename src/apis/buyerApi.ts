/**
 * Buyer API – maps to backend endpoints.
 * Update API_PATHS in apiConfig.ts when Swagger spec is available.
 */
import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import { bikeApi } from "./bikeApi";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type {
  Order,
  CreateOrderRequest,
  InitiatePaymentRequest,
} from "@/types/order";

export const getListings = (): Promise<Listing[]> => bikeApi.getAll();
export const getListingById = (id: string): Promise<BikeDetail> =>
  bikeApi.getById(id);

export const orderApi = {
  create: (data: CreateOrderRequest): Promise<Order> =>
    apiClient.post(API_PATHS.BUYER.ORDERS, data).then((r) => r.data?.data ?? r.data),

  getById: (orderId: string): Promise<Order> =>
    apiClient
      .get(API_PATHS.BUYER.ORDER_BY_ID(orderId))
      .then((r) => r.data?.data ?? r.data),

  getMyOrders: (): Promise<Order[]> =>
    apiClient
      .get(API_PATHS.BUYER.ORDERS)
      .then((r) => {
        const raw = r.data?.content ?? r.data?.data ?? r.data;
        return Array.isArray(raw) ? raw : [];
      }),

  complete: (orderId: string): Promise<Order> =>
    apiClient
      .put(API_PATHS.BUYER.ORDER_COMPLETE(orderId))
      .then((r) => r.data?.data ?? r.data),
};

export const paymentApi = {
  initiate: (data: InitiatePaymentRequest): Promise<{ paymentUrl?: string }> =>
    apiClient
      .post(API_PATHS.BUYER.PAYMENTS_INITIATE, data)
      .then((r) => r.data?.data ?? r.data),

  confirm: (orderId: string, payload?: Record<string, unknown>): Promise<Order> =>
    apiClient
      .post(API_PATHS.BUYER.PAYMENTS_CONFIRM(orderId), payload)
      .then((r) => r.data?.data ?? r.data),
};

export const transactionApi = {
  getStatus: (orderId: string): Promise<Order> =>
    apiClient
      .get(API_PATHS.BUYER.TRANSACTIONS(orderId))
      .then((r) => r.data?.data ?? r.data),
};

export type BuyerProfile = {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  phone?: string;
};

export const buyerProfileApi = {
  get: (): Promise<BuyerProfile> =>
    apiClient.get(API_PATHS.BUYER.PROFILE).then((r) => r.data?.data ?? r.data),
};
