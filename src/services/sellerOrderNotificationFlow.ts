/**
 * Luồng thông báo đơn hàng cho SELLER (trong app, không phải push/email).
 *
 * ─── CÓ thông báo (active) ───
 * 1. DIRECT + PENDING_SELLER_SHIP → nhắc giao xe trực tiếp cho buyer (không qua kho).
 * 2. Không phải DIRECT (WAREHOUSE / legacy) + SELLER_SHIPPED | AT_WAREHOUSE_PENDING_ADMIN
 *    → nhắc gửi kho / chờ xử lý kho.
 *
 * ─── KHÔNG thông báo (silent) ───
 * - SHIPPING, COMPLETED, RE_INSPECTION, CANCELLED, v.v.
 * - DIRECT nhưng không còn PENDING_SELLER_SHIP (đã bấm “đã giao” hoặc sai trạng thái).
 * - Luồng kho nhưng không ở hai trạng thái “cần seller/chờ kho” ở trên → không spam.
 */

export type SellerOrderListItem = {
  id: string;
  listingId: string;
  listing?: { brand?: string; model?: string };
  status: string;
  fulfillmentType?: string;
};

/** Luồng đang bật thông báo nhắc việc */
export type ActiveSellerNotificationFlow =
  | "DIRECT_SHIP_REMINDER"
  | "WAREHOUSE_SHIP_REMINDER";

/** Lý do không đẩy thông báo (debug / tài liệu) */
export type InactiveSellerNotificationReason = "DIRECT_WRONG_STATUS" | "WAREHOUSE_WRONG_STATUS";

export type SellerNotificationResolution =
  | { active: true; flow: ActiveSellerNotificationFlow; order: SellerOrderListItem }
  | {
      active: false;
      order: SellerOrderListItem;
      reason: InactiveSellerNotificationReason;
    };

const WAREHOUSE_PENDING_SELLER_STATUSES = ["SELLER_SHIPPED", "AT_WAREHOUSE_PENDING_ADMIN"] as const;

function isWarehouseShipReminderStatus(status: string): boolean {
  return (WAREHOUSE_PENDING_SELLER_STATUSES as readonly string[]).includes(status);
}

/**
 * Quyết định một đơn (từ GET /seller/orders) có được đồng bộ vào hộp thông báo hay không.
 */
export function resolveSellerOrderNotification(o: SellerOrderListItem): SellerNotificationResolution {
  const { status } = o;
  const isDirect = o.fulfillmentType === "DIRECT";

  if (isDirect) {
    if (status === "PENDING_SELLER_SHIP") {
      return { active: true, flow: "DIRECT_SHIP_REMINDER", order: o };
    }
    return { active: false, order: o, reason: "DIRECT_WRONG_STATUS" };
  }

  if (isWarehouseShipReminderStatus(status)) {
    return { active: true, flow: "WAREHOUSE_SHIP_REMINDER", order: o };
  }

  return { active: false, order: o, reason: "WAREHOUSE_WRONG_STATUS" };
}

export type PartitionSellerNotifications = {
  /** Đơn sẽ gọi addNotification (mỗi sourceKey một lần trong store) */
  notify: { order: SellerOrderListItem; flow: ActiveSellerNotificationFlow }[];
  /** Đơn cố tình không thông báo */
  silent: { order: SellerOrderListItem; reason: InactiveSellerNotificationReason }[];
};

/**
 * Tách danh sách đơn seller thành hai nhóm: cần thông báo vs im lặng.
 */
export function partitionSellerOrdersByNotificationFlow(
  orders: SellerOrderListItem[],
): PartitionSellerNotifications {
  const notify: PartitionSellerNotifications["notify"] = [];
  const silent: PartitionSellerNotifications["silent"] = [];

  for (const o of orders) {
    const r = resolveSellerOrderNotification(o);
    if (r.active) {
      notify.push({ order: r.order, flow: r.flow });
    } else {
      silent.push({ order: r.order, reason: r.reason });
    }
  }

  return { notify, silent };
}
