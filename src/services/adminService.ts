/**
 * Admin service – quản lý người dùng, kho, báo cáo, danh mục, giao dịch, thống kê.
 * Khi backend đã có API, ưu tiên gọi API; nếu lỗi/404 sẽ fallback sang mock để demo.
 */
import type { Order } from "@/types/order";
import type { Listing } from "@/types/shopbike";
import { setOrderOverride } from "@/lib/orderOverrides";
import { useNotificationStore } from "@/stores/useNotificationStore";

type TFunction = (key: string, params?: Record<string, string | number>) => string;
import {
  adminApi,
  type AdminStats as ApiAdminStats,
  type OrderWithListing as ApiOrderWithListing,
  type AdminUser,
  type AdminSellerSubscriptionRow,
  type AdminSubscriptionSummary,
} from "@/apis/adminApi";

type OrderWithListing = Order & { listing?: Listing };
const _orders: OrderWithListing[] = [
  {
    id: "ORD-W1",
    listingId: "1",
    buyerId: "buyer_01",
    sellerId: "seller_01",
    status: "SELLER_SHIPPED",
    totalPrice: 180000000,
    depositAmount: 14400000,
    depositPaid: true,
    shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    listing: {
      id: "1",
      brand: "Specialized",
      model: "Tarmac SL7",
      price: 180000000,
      certificationStatus: "CERTIFIED",
    } as Listing,
  },
  {
    id: "ORD-W2",
    listingId: "2",
    buyerId: "buyer_02",
    sellerId: "seller_02",
    status: "AT_WAREHOUSE_PENDING_ADMIN",
    totalPrice: 95000000,
    depositAmount: 7600000,
    depositPaid: true,
    shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    listing: {
      id: "2",
      brand: "Trek",
      model: "Domane SL",
      price: 95000000,
      certificationStatus: "CERTIFIED",
    } as Listing,
  },
  {
    id: "ORD-W3",
    listingId: "1",
    buyerId: "buyer_03",
    sellerId: "seller_01",
    status: "RE_INSPECTION",
    totalPrice: 180000000,
    depositAmount: 14400000,
    depositPaid: true,
    shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    warehouseConfirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    listing: {
      id: "1",
      brand: "Specialized",
      model: "Tarmac SL7",
      price: 180000000,
      certificationStatus: "CERTIFIED",
    } as Listing,
  },
];
const MOCK_ORDERS_WAREHOUSE = _orders;

export type AdminStats = {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalListings: number;
  totalOrders: number;
  ordersPendingWarehouse: number;
  ordersReInspection: number;
  listingsPendingWarehouseIntake?: number;
};

export async function fetchOrdersForWarehouseConfirm(): Promise<OrderWithListing[]> {
  try {
    const apiData = await adminApi.getWarehouseOrders();
    return apiData as ApiOrderWithListing[];
  } catch {
    // Fallback mock
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ORDERS_WAREHOUSE.filter(
      (o) => o.status === "SELLER_SHIPPED" || o.status === "AT_WAREHOUSE_PENDING_ADMIN",
    ).map((o) => ({ ...o }));
  }
}

export async function confirmWarehouseArrival(orderId: string): Promise<Order> {
  try {
    const order = await adminApi.confirmWarehouseArrival(orderId);
    setOrderOverride(order.id, {
      status: order.status,
      warehouseConfirmedAt: order.warehouseConfirmedAt,
    });
    return order;
  } catch {
    await new Promise((r) => setTimeout(r, 400));
    const order = MOCK_ORDERS_WAREHOUSE.find((o) => o.id === orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng.");
    order.status = "RE_INSPECTION";
    order.warehouseConfirmedAt = new Date().toISOString();
    setOrderOverride(order.id, {
      status: order.status,
      warehouseConfirmedAt: order.warehouseConfirmedAt,
    });
    return { ...order };
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const stats = await adminApi.getStats();
    return stats as ApiAdminStats;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
    return {
      totalUsers: 124,
      totalBuyers: 80,
      totalSellers: 32,
      totalListings: 56,
      totalOrders: 89,
      ordersPendingWarehouse: 2,
      ordersReInspection: 1,
      listingsPendingWarehouseIntake: 0,
    };
  }
}

/** Mock: danh sách đơn cần kiểm định lại tại kho (cho inspector) */
export async function fetchReInspectionOrders(): Promise<OrderWithListing[]> {
  try {
    const apiData = await adminApi.getReInspectionOrders();
    return apiData as ApiOrderWithListing[];
  } catch {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ORDERS_WAREHOUSE.filter((o) => o.status === "RE_INSPECTION").map((o) => ({ ...o }));
  }
}

export async function submitReInspectionDone(orderId: string): Promise<Order> {
  try {
    const order = await adminApi.submitReInspectionDone(orderId);
    setOrderOverride(order.id, {
      status: order.status,
      reInspectionDoneAt: order.reInspectionDoneAt,
    });
    return order;
  } catch {
    await new Promise((r) => setTimeout(r, 400));
    const order = MOCK_ORDERS_WAREHOUSE.find((o) => o.id === orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng.");
    order.status = "SHIPPING";
    order.reInspectionDoneAt = new Date().toISOString();
    setOrderOverride(order.id, {
      status: order.status,
      reInspectionDoneAt: order.reInspectionDoneAt,
    });
    return { ...order };
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    return await adminApi.getUsers();
  } catch {
    return [];
  }
}

export type { AdminSellerSubscriptionRow, AdminSubscriptionSummary };

export async function fetchSellerSubscriptions(params?: {
  q?: string;
  limit?: number;
}): Promise<AdminSellerSubscriptionRow[]> {
  return await adminApi.getSellerSubscriptions(params);
}

export async function revokeSellerSubscriptionApi(userId: string): Promise<{
  user: AdminUser;
  subscription: AdminSubscriptionSummary;
  revoked: boolean;
}> {
  return await adminApi.revokeSellerSubscription(userId);
}

export async function hideAdminUser(id: string): Promise<AdminUser> {
  return await adminApi.hideUser(id);
}

export async function unhideAdminUser(id: string): Promise<AdminUser> {
  return await adminApi.unhideUser(id);
}

export async function fetchAdminListings(): Promise<Listing[]> {
  try {
    return await adminApi.getListings();
  } catch {
    return [];
  }
}

/** Tin kiểm định: seller đã báo gửi xe — chờ admin xác nhận tại kho + khớp ảnh. */
export async function fetchPendingWarehouseIntakeListings(): Promise<Listing[]> {
  try {
    return await adminApi.getPendingWarehouseIntakeListings();
  } catch {
    return [];
  }
}

export async function confirmWarehouseIntakeListing(listingId: string): Promise<Listing> {
  return await adminApi.confirmWarehouseIntake(listingId);
}

export async function confirmWarehouseReInspectionListing(
  listingId: string,
  body: { action: "approve" | "need_update"; reason?: string },
): Promise<Listing> {
  return await adminApi.confirmWarehouseReInspection(listingId, body);
}

export async function hideAdminListing(id: string): Promise<Listing> {
  return await adminApi.hideListing(id);
}

export async function unhideAdminListing(id: string): Promise<Listing> {
  return await adminApi.unhideListing(id);
}

export type AdminBrand = { id: string; name: string; slug?: string; active?: boolean };

export async function fetchAdminBrands(): Promise<AdminBrand[]> {
  try {
    return await adminApi.getBrands();
  } catch {
    return [];
  }
}

export async function createAdminBrand(data: { name: string; slug?: string }): Promise<AdminBrand> {
  return await adminApi.createBrand(data);
}

export async function updateAdminBrand(id: string, data: { name?: string; slug?: string; active?: boolean }): Promise<AdminBrand> {
  return await adminApi.updateBrand(id, data);
}

export async function deleteAdminBrand(id: string): Promise<void> {
  await adminApi.deleteBrand(id);
}

/**
 * Đồng bộ thông báo Admin cho đơn hàng.
 * Luồng warehouse cho đơn đã loại bỏ — không còn thông báo "xuất kho giao".
 */
export async function syncAdminOrderNotifications(_t: TFunction): Promise<void> {
  // Luồng warehouse cho đơn đã loại bỏ — không thông báo đơn warehouse nữa
}
