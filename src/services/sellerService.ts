/**
 * Seller service – gọi API thật hoặc fallback mock khi BE chưa sẵn sàng.
 * Có timeout để tránh load mãi khi backend treo.
 */
import { sellerApi, type SellerDashboardStats, type CreateListingRequest } from "@/apis/sellerApi";
import type { Listing } from "@/types/shopbike";
import { useNotificationStore } from "@/stores/useNotificationStore";

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
  } catch {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return found ?? null;
  }
}

export async function fetchSellerOrders(): Promise<
  { id: string; listingId: string; listing?: { brand?: string; model?: string }; status: string }[]
> {
  try {
    return await sellerApi.getOrders();
  } catch {
    return [];
  }
}

/** Đồng bộ đơn cần gửi xe sang thông báo seller (gọi từ Header, SellerDashboard, NotificationsPage) */
export async function syncSellerOrderNotifications(): Promise<void> {
  const { addNotification } = useNotificationStore.getState();
  const orders = await fetchSellerOrders();
  const needShip = orders.filter(
    (o) => o.status === "SELLER_SHIPPED" || o.status === "AT_WAREHOUSE_PENDING_ADMIN",
  );
  needShip.forEach((o) => {
    const bikeName =
      o.listing?.brand && o.listing?.model ? `${o.listing.brand} ${o.listing.model}` : "xe";
    addNotification({
      role: "SELLER",
      type: "success",
      title: "Buyer đã mua hàng – cần gửi xe tới kho",
      message: `Đơn ${o.id} (${bikeName}). Vui lòng vận chuyển xe tới kho.`,
      link: "/seller",
      sourceKey: `seller-order-${o.id}`,
    });
  });
}

export async function fetchSellerDashboard(): Promise<{
  stats: SellerDashboardStats;
  listings: Listing[];
}> {
  if (USE_MOCK) return mockStats();
  try {
    return await withTimeout(
      sellerApi.getDashboard(),
      FETCH_TIMEOUT_MS,
      "Backend không phản hồi.",
    );
  } catch (_) {
    return mockStats();
  }
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
  try {
    return await sellerApi.create(data);
  } catch {
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
}

export async function updateListing(
  id: string,
  data: Partial<CreateListingRequest>,
): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), ...data, id } as Listing;
  }
  try {
    return await sellerApi.update(id, data);
  } catch {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), ...data, id } as Listing;
  }
}

export async function submitForInspection(id: string): Promise<Listing> {
  if (USE_MOCK) {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), id, state: "PENDING_INSPECTION" as const } as Listing;
  }
  try {
    return await sellerApi.submitForInspection(id);
  } catch {
    const found = SELLER_MOCK.find((l) => l.id === id);
    return { ...(found ?? {}), id, state: "PENDING_INSPECTION" as const } as Listing;
  }
}
