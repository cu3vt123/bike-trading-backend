/**
 * Buyer service – có thể gọi API thật hoặc fallback mock khi BE chưa sẵn sàng.
 * Dùng try/catch: API lỗi → dùng mock.
 */
import * as buyerApi from "@/apis/buyerApi";
import { getListingById } from "@/mocks/mockListings";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type { Order, OrderFulfillmentType, InitiatePaymentMethod } from "@/types/order";
import type { VnpayCheckoutResponse } from "@/apis/buyerApi";

import { USE_MOCK_API } from "@/lib/apiConfig";
import { applyOrderOverrides, setOrderOverride } from "@/lib/orderOverrides";

const USE_MOCK = USE_MOCK_API;

/* --- Listings --- */
export async function fetchListings(): Promise<Listing[]> {
  if (USE_MOCK) {
    const { MOCK_LISTINGS } = await import("@/mocks/mockListings");
    return MOCK_LISTINGS.filter((x) => x.state === "PUBLISHED");
  }
  try {
    return await buyerApi.getListings();
  } catch {
    const { MOCK_LISTINGS } = await import("@/mocks/mockListings");
    return MOCK_LISTINGS.filter((x) => x.state === "PUBLISHED");
  }
}

export async function fetchListingById(id: string): Promise<BikeDetail | null> {
  if (USE_MOCK) {
    return getListingById(id) ?? null;
  }
  try {
    return await buyerApi.getListingById(id);
  } catch {
    const found = getListingById(id);
    return found ? { ...found } : null;
  }
}

/* --- Orders (scaffold – chưa có mock đầy đủ) --- */
export async function createOrder(
  data: Parameters<typeof buyerApi.orderApi.create>[0],
): Promise<Order> {
  if (USE_MOCK) {
    return mockCreateOrder(data);
  }
  try {
    return await buyerApi.orderApi.create(data);
  } catch {
    return mockCreateOrder(data);
  }
}

/** Đặt hàng + redirect VNPAY Sandbox (cần backend thật, không dùng mock API) */
export async function createVnpayCheckoutOrder(
  data: Parameters<typeof buyerApi.orderApi.create>[0],
): Promise<VnpayCheckoutResponse> {
  if (USE_MOCK) {
    throw new Error("VNPAY: tắt VITE_USE_MOCK_API và cấu hình backend + VNP_* trong .env.");
  }
  return await buyerApi.orderApi.createVnpayCheckout(data);
}

/** Tạo lại URL VNPAY cho đơn PENDING_PAYMENT (cùng orderId) */
export async function resumeVnpayCheckoutOrder(orderId: string): Promise<{
  paymentUrl: string;
  txnRef?: string;
  vnpayAmountVnd?: number;
}> {
  if (USE_MOCK) {
    throw new Error("VNPAY: tắt VITE_USE_MOCK_API và cấu hình backend + VNP_* trong .env.");
  }
  return await buyerApi.orderApi.resumeVnpayCheckout(orderId);
}

function mockCreateOrder(data: {
  listingId: string;
  plan: string;
  shippingAddress: Record<string, string>;
  acceptedUnverifiedDisclaimer?: boolean;
}): Order {
  const listing = getListingById(data.listingId);
  const price = listing?.price ?? 0;
  const deposit = Math.round(price * 0.08);
  /** Xe CERTIFIED → WAREHOUSE (kho giao), xe chưa kiểm định → DIRECT (seller giao). */
  const fulfillmentType: OrderFulfillmentType =
    listing?.certificationStatus === "CERTIFIED" ? "WAREHOUSE" : "DIRECT";
  return {
    id: `ORD-${Date.now()}`,
    listingId: data.listingId,
    listing: listing ?? undefined,
    status: fulfillmentType === "DIRECT" ? "PENDING_SELLER_SHIP" : "RESERVED",
    fulfillmentType,
    totalPrice: price,
    depositAmount: deposit,
    depositPaid: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (USE_MOCK) return null;
  try {
    return await buyerApi.orderApi.getById(orderId);
  } catch {
    return null;
  }
}

export async function fetchMyOrders(): Promise<Order[]> {
  try {
    const orders = await buyerApi.orderApi.getMyOrders();
    return applyOrderOverrides(orders);
  } catch {
    if (USE_MOCK) return [];
    return [];
  }
}

export async function completeOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const mock = { id: orderId, listingId: "", status: "COMPLETED" } as Order;
    setOrderOverride(orderId, { status: mock.status });
    return mock;
  }
  const order = await buyerApi.orderApi.complete(orderId);
  setOrderOverride(orderId, { status: "COMPLETED" });
  return order;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const mock = { id: orderId, listingId: "", status: "CANCELLED" } as Order;
    setOrderOverride(orderId, { status: mock.status });
    return mock;
  }
  const order = await buyerApi.orderApi.cancel(orderId);
  setOrderOverride(orderId, { status: "CANCELLED" });
  return order;
}

export type ValidatePaymentResult = {
  ok: boolean;
  paymentMethod?: { type: string; brand?: string; last4?: string; bankRef?: string; provider?: string; paymentRef?: string };
  error?: string;
};

function parseInitiateResponse(res: unknown): ValidatePaymentResult {
  const d = res as {
    ok?: boolean;
    paymentMethod?: ValidatePaymentResult["paymentMethod"];
  };
  if (!d?.ok || !d.paymentMethod) {
    return { ok: false, error: "Payment validation failed" };
  }
  return {
    ok: true,
    paymentMethod: d.paymentMethod,
  };
}

/** Validate payment COD trước khi tạo đơn */
export async function validatePayment(data: {
  method: InitiatePaymentMethod;
  amount?: number;
}): Promise<ValidatePaymentResult> {
  if (USE_MOCK) {
    if (data.method === "CASH") {
      return { ok: true, paymentMethod: { type: "CASH" } };
    }
    return { ok: false, error: "Unsupported payment method" };
  }
  try {
    const res = await buyerApi.paymentApi.initiate({ method: "CASH" });
    return parseInitiateResponse(res);
  } catch (err: unknown) {
    const msg =
      err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : err instanceof Error
          ? err.message
          : "Payment validation failed";
    return { ok: false, error: String(msg) };
  }
}
