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

export type VnpayCheckoutResponse = Order & {
  paymentUrl: string;
  txnRef: string;
  vnpayPaymentStatus: string;
  vnpayAmountVnd?: number;
};

export const orderApi = {
  create: (data: CreateOrderRequest): Promise<Order> =>
    apiClient.post(API_PATHS.BUYER.ORDERS, data).then((r) => r.data?.data ?? r.data),

  /** Tạo đơn + URL redirect VNPAY Sandbox (IPN cập nhật PAID / FAILED) */
  createVnpayCheckout: (data: CreateOrderRequest): Promise<VnpayCheckoutResponse> =>
    apiClient
      .post(API_PATHS.BUYER.ORDERS_VNPAY_CHECKOUT, data)
      .then((r) => r.data?.data ?? r.data),

  resumeVnpayCheckout: (
    orderId: string,
  ): Promise<{ paymentUrl: string; txnRef?: string; orderId?: string; vnpayAmountVnd?: number }> =>
    apiClient
      .post(API_PATHS.BUYER.ORDER_VNPAY_RESUME(orderId))
      .then((r) => r.data?.data ?? r.data),

  payBalanceVnpay: (
    orderId: string,
  ): Promise<{ paymentUrl: string; orderId: string; balanceAmount: number }> =>
    apiClient
      .post(API_PATHS.BUYER.ORDER_VNPAY_PAY_BALANCE(orderId))
      .then((r) => r.data?.data ?? r.data),

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

  cancel: (orderId: string): Promise<Order> =>
    apiClient
      .put(API_PATHS.BUYER.ORDER_CANCEL(orderId))
      .then((r) => r.data?.data ?? r.data),
};

export const paymentApi = {
  initiate: (data: InitiatePaymentRequest): Promise<{ paymentUrl?: string }> =>
    apiClient
      .post(API_PATHS.BUYER.PAYMENTS_INITIATE, data)
      .then((r) => r.data?.data ?? r.data),
};

