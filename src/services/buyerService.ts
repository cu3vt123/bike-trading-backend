/**
 * Buyer service – có thể gọi API thật hoặc fallback mock khi BE chưa sẵn sàng.
 * Dùng try/catch: API lỗi → dùng mock.
 */
import * as buyerApi from "@/apis/buyerApi";
import { getListingById } from "@/mocks/mockListings";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type { Order } from "@/types/order";

import { USE_MOCK_API } from "@/lib/apiConfig";
import { applyOrderOverrides, setOrderOverride } from "@/lib/orderOverrides";

const USE_MOCK = USE_MOCK_API;

/* --- Listings --- */
export async function fetchListings(): Promise<Listing[]> {
  if (USE_MOCK) {
    const { MOCK_LISTINGS } = await import("@/mocks/mockListings");
    return MOCK_LISTINGS.filter(
      (x) => x.state === "PUBLISHED" && x.inspectionResult === "APPROVE",
    );
  }
  try {
    return await buyerApi.getListings();
  } catch {
    const { MOCK_LISTINGS } = await import("@/mocks/mockListings");
    return MOCK_LISTINGS.filter(
      (x) => x.state === "PUBLISHED" && x.inspectionResult === "APPROVE",
    );
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

function mockCreateOrder(data: {
  listingId: string;
  plan: string;
  shippingAddress: Record<string, string>;
}): Order {
  const listing = getListingById(data.listingId);
  const price = listing?.price ?? 0;
  const deposit = Math.round(price * 0.08);
  return {
    id: `ORD-${Date.now()}`,
    listingId: data.listingId,
    listing: listing ?? undefined,
    status: "RESERVED",
    totalPrice: price,
    depositAmount: deposit,
    depositPaid: false,
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
  if (USE_MOCK) {
    return [];
  }
  try {
    const orders = await buyerApi.orderApi.getMyOrders();
    return applyOrderOverrides(orders);
  } catch {
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

/** Validate payment (Visa/Bank) via backend sandbox before order creation */
export async function validatePayment(data: {
  method: "CARD" | "BANK_TRANSFER";
  cardDetails?: { number: string; name: string; exp: string; cvc: string };
  bankDetails?: { accountNumber: string; bankName: string; accountHolderName?: string };
}): Promise<{ ok: boolean; paymentMethod?: { type: string; brand?: string; last4?: string; bankRef?: string }; error?: string }> {
  if (USE_MOCK) {
    if (data.method === "CARD" && data.cardDetails) {
      const last4 = data.cardDetails.number.replace(/\D/g, "").slice(-4) || "0000";
      return { ok: true, paymentMethod: { type: "CARD", brand: "Visa", last4 } };
    }
    return { ok: true, paymentMethod: { type: "BANK_TRANSFER", bankRef: "BANK-MOCK" } };
  }
  try {
    const res = await buyerApi.paymentApi.initiate(data as Parameters<typeof buyerApi.paymentApi.initiate>[0]);
    const d = res as { ok?: boolean; paymentMethod?: Record<string, unknown> };
    if (d?.ok && d?.paymentMethod) {
      return { ok: true, paymentMethod: d.paymentMethod };
    }
    return { ok: false, error: "Payment validation failed" };
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : err instanceof Error ? err.message : "Payment validation failed";
    return { ok: false, error: String(msg) };
  }
}
