/**
 * Luồng thông báo đơn hàng cho ADMIN (trong app, không phải push/email).
 *
 * Luồng WAREHOUSE cho đơn hàng đã loại bỏ: không còn "buyer mua rồi seller gửi xe tới kho".
 * Kho chỉ dùng cho kiểm định tin đăng (listing flow).
 */

export type AdminOrderListItem = {
  id: string;
  listingId: string;
  listing?: { brand?: string; model?: string };
  status: string;
  fulfillmentType?: string;
  depositPaid?: boolean;
};

/**
 * Lấy danh sách đơn cần thông báo Admin "đã cọc – xuất kho giao".
 * Luồng đã loại bỏ – luôn trả về rỗng.
 */
export function getDepositPaidOrdersForAdminRelease(
  _orders: AdminOrderListItem[],
): AdminOrderListItem[] {
  return [];
}
