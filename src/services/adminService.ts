/**
 * Admin service – quản lý người dùng, kho, báo cáo, danh mục, giao dịch, thống kê.
 * Khi backend đã có API, ưu tiên gọi API; nếu lỗi/404 sẽ fallback sang mock để demo.
 */
import type { Order } from "@/types/order";
import type { Listing } from "@/types/shopbike";
import { setOrderOverride } from "@/lib/orderOverrides";
import { adminApi, type AdminStats as ApiAdminStats, type OrderWithListing as ApiOrderWithListing } from "@/apis/adminApi";

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
    listing: { id: "1", brand: "Specialized", model: "Tarmac SL7", price: 180000000 } as Listing,
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
    listing: { id: "2", brand: "Trek", model: "Domane SL", price: 95000000 } as Listing,
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
    listing: { id: "1", brand: "Specialized", model: "Tarmac SL7", price: 180000000 } as Listing,
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
