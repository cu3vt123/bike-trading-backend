/**
 * Buyer service – có thể gọi API thật hoặc fallback mock khi BE chưa sẵn sàng.
 * Dùng try/catch: API lỗi → dùng mock.
 */
import * as buyerApi from "@/apis/buyerApi";
import { getListingById } from "@/mocks/mockListings";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type { Order } from "@/types/order";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

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
    return []; // BuyerProfilePage dùng MOCK_ORDERS riêng
  }
  try {
    return await buyerApi.orderApi.getMyOrders();
  } catch {
    return [];
  }
}
