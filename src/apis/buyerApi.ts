/**
 * SHOP-21: Buyer API mapping scaffold.
 * Khi Backend sẵn sàng, các endpoint này sẽ gọi API thật.
 * Hiện dùng apiClient – khi BE chưa có sẽ lỗi; pages vẫn dùng mock.
 */
import apiClient from "@/lib/apiClient";
import { bikeApi } from "./bikeApi";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type {
  Order,
  CreateOrderRequest,
  InitiatePaymentRequest,
} from "@/types/order";

/* --- Listings (re-export từ bikeApi) --- */
export const getListings = (): Promise<Listing[]> => bikeApi.getAll();
export const getListingById = (id: string): Promise<BikeDetail> =>
  bikeApi.getById(id);

/* --- Orders --- */
export const orderApi = {
  create: (data: CreateOrderRequest): Promise<Order> =>
    apiClient.post("/buyer/orders", data).then((r) => r.data?.data ?? r.data),

  getById: (orderId: string): Promise<Order> =>
    apiClient
      .get(`/buyer/orders/${orderId}`)
      .then((r) => r.data?.data ?? r.data),

  getMyOrders: (): Promise<Order[]> =>
    apiClient
      .get("/buyer/orders")
      .then((r) => {
        const raw = r.data?.content ?? r.data?.data ?? r.data;
        return Array.isArray(raw) ? raw : [];
      }),
};

/* --- Payment --- */
export const paymentApi = {
  initiate: (data: InitiatePaymentRequest): Promise<{ paymentUrl?: string }> =>
    apiClient
      .post("/buyer/payments/initiate", data)
      .then((r) => r.data?.data ?? r.data),

  confirm: (orderId: string, payload?: Record<string, unknown>): Promise<Order> =>
    apiClient
      .post(`/buyer/payments/confirm/${orderId}`, payload)
      .then((r) => r.data?.data ?? r.data),
};

/* --- Transaction (order trong flow mua) --- */
export const transactionApi = {
  getStatus: (orderId: string): Promise<Order> =>
    apiClient
      .get(`/buyer/transactions/${orderId}`)
      .then((r) => r.data?.data ?? r.data),
};

/* --- Buyer Profile --- */
export type BuyerProfile = {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  phone?: string;
};

export const buyerProfileApi = {
  get: (): Promise<BuyerProfile> =>
    apiClient.get("/buyer/profile").then((r) => r.data?.data ?? r.data),
};
