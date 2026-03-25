/**
 * Seller service – gọi API thật hoặc fallback mock khi BE chưa sẵn sàng.
 * Có timeout để tránh load mãi khi backend treo.
 */
import { isAxiosError } from "axios";
import {
  sellerApi,
  type SellerDashboardStats,
  type CreateListingRequest,
  type SellerRatingsSummary,
} from "@/apis/sellerApi";
import type { Listing } from "@/types/shopbike";
import type { Order } from "@/types/order";
import { useNotificationStore } from "@/stores/useNotificationStore";
import {
  partitionSellerOrdersByNotificationFlow,
  type SellerOrderListItem,
} from "@/services/sellerOrderNotificationFlow";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

const FETCH_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

// Mock data (giống SellerDashboardPage hiện tại)
const SELLER_MOCK: Listing[] = [
  {
    id: "S-101",
    title: "Specialized Tarmac SL7 — ready for inspection",
    brand: "Specialized",
    price: 7200,
    location: "Ho Chi Minh City",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1400&q=60",
    state: "DRAFT",
    inspectionResult: null,
  },
  {
    id: "S-102",
    title: "Trek Domane SL — submitted for review",
    brand: "Trek",
    price: 3100,
    location: "Da Nang",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1400&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
  {
    id: "S-103",
    title: "Cannondale SuperSix — please update photos",
    brand: "Cannondale",
    price: 3850,
    location: "Ha Noi",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1400&q=60",
    state: "NEED_UPDATE",
    inspectionResult: "NEED_UPDATE",
  },
  {
    id: "S-104",
    title: "Cervelo S5 Aero — approved & published",
    brand: "Cervelo",
    price: 6900,
    location: "Ho Chi Minh City",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1400&q=60",
    state: "PUBLISHED",
    inspectionResult: "APPROVE",
  },
];

function mockStats(): { stats: SellerDashboardStats; listings: Listing[] } {
  const listings = [...SELLER_MOCK];
  const stats: SellerDashboardStats = {
    total: listings.length,
    published: listings.filter((x) => x.state === "PUBLISHED").length,
    inReview: listings.filter((x) => x.state === "PENDING_INSPECTION").length,
    awaitingWarehouse: 0,
    atWarehousePendingVerify: 0,
    needUpdate: listings.filter((x) => x.state === "NEED_UPDATE").length,
  };
  return { stats, listings };
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return found ?? null;
  }
  try {
    return await sellerApi.getListingById(id);
  } catch (e) {
    /** Không giả mạo dữ liệu khi lỗi mạng/403 — tránh UI lệch với server (kẹt nháp / tưởng đã đăng). */
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export async function fetchSellerOrders(): Promise<SellerOrderListItem[]> {
  try {
    return await sellerApi.getOrders();
  } catch {
    return [];
  }
}

export async function shipOrderToBuyer(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    return {
      id: orderId,
      listingId: "",
      status: "SHIPPING",
      totalPrice: 0,
      fulfillmentType: "DIRECT",
      depositPaid: true,
    };
  }
  return sellerApi.shipOrderToBuyer(orderId);
}

export async function markListingShippedToWarehouse(listingId: string): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === listingId);
    if (found && found.state === "AWAITING_WAREHOUSE") {
      (found as Listing).state = "AT_WAREHOUSE_PENDING_VERIFY";
    }
    return (
      found ?? {
        id: listingId,
        title: "",
        brand: "",
        price: 0,
        location: "",
        state: "AT_WAREHOUSE_PENDING_VERIFY",
      }
    );
  }
  return sellerApi.markListingShippedToWarehouse(listingId);
}

type TFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Đồng bộ **chỉ** các đơn thuộc luồng “có thông báo” vào hộp thông báo.
 * Luồng “không thông báo” được tách trong `sellerOrderNotificationFlow.ts` (hàm partition / resolve).
 */
export async function syncSellerOrderNotifications(t: TFunction): Promise<void> {
  await syncSellerListingNotifications(t);
  const { addNotification } = useNotificationStore.getState();
  const orders = await fetchSellerOrders();
  const { notify } = partitionSellerOrdersByNotificationFlow(orders);

  for (const { order: o, flow } of notify) {
    const bikeName =
      o.listing?.brand && o.listing?.model ? `${o.listing.brand} ${o.listing.model}` : "xe";

    if (flow === "DIRECT_SHIP_REMINDER") {
      addNotification({
        role: "SELLER",
        type: "success",
        title: t("notifications.buyerPurchasedDirectTitle"),
        message: t("notifications.buyerPurchasedDirectMessage", { orderId: o.id, bikeName }),
        titleKey: "notifications.buyerPurchasedDirectTitle",
        messageKey: "notifications.buyerPurchasedDirectMessage",
        messageParams: { orderId: o.id, bikeName },
        link: "/seller",
        sourceKey: `seller-order-direct-${o.id}`,
      });
    }
  }
}

/**
 * Đồng bộ thông báo khi inspector kiểm định thành công (listing AWAITING_WAREHOUSE).
 * Seller cần gửi xe tới kho để admin xác nhận.
 */
export async function syncSellerListingNotifications(t: TFunction): Promise<void> {
  const { addNotification } = useNotificationStore.getState();
  try {
    const res = await sellerApi.getDashboard();
    const listings = res.listings ?? [];
    const awaiting = listings.filter((l) => l.state === "AWAITING_WAREHOUSE");
    for (const l of awaiting) {
      const bikeName = l.brand && l.model ? `${l.brand} ${l.model}` : l.title || "xe";
      addNotification({
        role: "SELLER",
        type: "success",
        title: t("notifications.inspectorApprovedTitle"),
        message: t("notifications.inspectorApprovedMessage", { bikeName }),
        titleKey: "notifications.inspectorApprovedTitle",
        messageKey: "notifications.inspectorApprovedMessage",
        messageParams: { bikeName },
        link: "/seller",
        sourceKey: `listing-inspected-${l.id}`,
      });
    }
  } catch {
    /* ignore */
  }
}

/** Re-export để test hoặc màn hình debug (optional). */
export {
  partitionSellerOrdersByNotificationFlow,
  resolveSellerOrderNotification,
} from "@/services/sellerOrderNotificationFlow";

const MOCK_DASHBOARD_ORDERS: Order[] = [
  {
    id: "ORD-101",
    listingId: "L1",
    listing: { id: "L1", title: "Trek Domane SL", brand: "Trek", model: "Domane SL", price: 3100, location: "", state: "PUBLISHED" },
    buyerId: "buyer_01",
    status: "RESERVED",
    totalPrice: 3100,
    depositAmount: 248,
    depositPaid: false,
  },
  {
    id: "ORD-102",
    listingId: "L2",
    listing: { id: "L2", title: "Cervelo S5", brand: "Cervelo", model: "S5", price: 6900, location: "", state: "PUBLISHED" },
    buyerId: "rider_99",
    status: "RESERVED",
    totalPrice: 6900,
    depositAmount: 552,
    depositPaid: true,
  },
];

const MOCK_RATINGS: SellerRatingsSummary = {
  averageRating: 4.8,
  totalReviews: 12,
  positivePercent: 97,
  breakdown: { 5: 10, 4: 2 },
};

export async function fetchSellerDashboard(): Promise<{
  stats: SellerDashboardStats;
  listings: Listing[];
}> {
  if (USE_MOCK) return mockStats();
  try {
    return await withTimeout(
      sellerApi.getDashboard(),
      FETCH_TIMEOUT_MS,
      "Hệ thống không phản hồi. Vui lòng thử lại.",
    );
  } catch (_) {
    return mockStats();
  }
}

/** Đơn hàng / đặt cọc cho dashboard seller. API thật hoặc mock khi BE chưa có. */
export async function fetchSellerDashboardOrders(): Promise<Order[]> {
  if (USE_MOCK) return MOCK_DASHBOARD_ORDERS;
  try {
    return await withTimeout(sellerApi.getOrders(), FETCH_TIMEOUT_MS, "Timeout");
  } catch {
    return MOCK_DASHBOARD_ORDERS;
  }
}

/** Đánh giá & uy tín seller. API thật hoặc null khi BE chưa có endpoint. */
export async function fetchSellerRatings(): Promise<SellerRatingsSummary | null> {
  if (USE_MOCK) return MOCK_RATINGS;
  try {
    return await withTimeout(sellerApi.getRatings(), FETCH_TIMEOUT_MS, "Timeout");
  } catch {
    return null;
  }
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  if (USE_MOCK) {
    return files.map(
      () =>
        "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1400&q=60",
    );
  }
  const formData = new FormData();
  for (const f of files) formData.append("images", f);
  const { urls } = await sellerApi.uploadListingImages(formData);
  if (urls.length !== files.length) {
    throw new Error("UPLOAD_COUNT_MISMATCH");
  }
  return urls;
}

export async function createListing(
  data: CreateListingRequest,
): Promise<Listing> {
  if (USE_MOCK) {
    return {
      id: `S-${Date.now()}`,
      title: data.title,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: data.price,
      location: data.location ?? "",
      state: "DRAFT",
    };
  }
  return sellerApi.create(data);
}

export async function updateListing(
  id: string,
  data: Partial<CreateListingRequest>,
): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), ...data, id } as Listing;
  }
  return sellerApi.update(id, data);
}

export async function submitForInspection(id: string): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), id, state: "PENDING_INSPECTION" as const } as Listing;
  }
  return sellerApi.submitForInspection(id);
}

export async function publishListing(
  id: string,
  opts: { requestInspection: boolean },
): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return {
      ...(found ?? {}),
      id,
      state: opts.requestInspection ? "PENDING_INSPECTION" : "PUBLISHED",
      certificationStatus: opts.requestInspection ? "PENDING_CERTIFICATION" : "UNVERIFIED",
    } as Listing;
  }
  return sellerApi.publishListing(id, opts);
}
