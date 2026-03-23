/**
 * Buyer flow types – scaffold for Backend API.
 * Khi BE có contract, đối chiếu và điều chỉnh.
 */

import type { Listing } from "./shopbike";

/** Trạng thái đơn hàng – bao gồm luồng shipping qua kho & kiểm định lại */
export type OrderStatus =
  | "PENDING"
  | "RESERVED" // Đã đặt cọc, thông báo seller
  | "PENDING_SELLER_SHIP" // Chờ seller giao xe (trực tiếp cho buyer)
  | "SELLER_SHIPPED" // Seller đã gửi, chờ kho nhận
  | "AT_WAREHOUSE_PENDING_ADMIN" // Xe tại kho, chờ admin xác nhận
  | "RE_INSPECTION" // Admin đã xác nhận, chờ inspector kiểm định lại
  | "RE_INSPECTION_DONE" // Inspector đã xác nhận đúng, chuyển giao hàng
  | "SHIPPING" // Đang giao hàng cho buyer
  | "IN_TRANSACTION" // (legacy) đang xử lý
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

/** Nhãn tiếng Việt cho từng trạng thái đơn (hiển thị cho buyer/seller/admin) */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  RESERVED: "Đã đặt cọc",
  PENDING_SELLER_SHIP: "Chờ seller giao xe",
  SELLER_SHIPPED: "Đang giao tới kho",
  AT_WAREHOUSE_PENDING_ADMIN: "Xe tại kho (chờ admin xác nhận)",
  RE_INSPECTION: "Đang kiểm định lại tại kho",
  RE_INSPECTION_DONE: "Đã kiểm định lại",
  SHIPPING: "Đang giao hàng",
  IN_TRANSACTION: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

/** Phương thức thanh toán lưu trên đơn (API / luồng buyer) */
export type PaymentMethod = "CASH" | "VNPAY_QR" | "VNPAY_SANDBOX";

/** API POST /buyer/payments/initiate — chỉ COD */
export type InitiatePaymentMethod = "CASH";

export type QrPaymentInfo = {
  provider: "VNPAY";
  paymentReference: string;
  amountVnd: number;
  qrContent: string;
};

/** Luồng WAREHOUSE cho đơn đã loại bỏ. DIRECT = seller giao thẳng buyer. */
export type OrderFulfillmentType = "WAREHOUSE" | "DIRECT";

export type Order = {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId?: string;
  sellerId?: string;
  status: OrderStatus;
  fulfillmentType?: OrderFulfillmentType;
  /** DEPOSIT = cọc VNPAY + phần còn lại COD; FULL = toàn bộ qua VNPAY */
  plan?: "DEPOSIT" | "FULL";
  totalPrice: number;
  depositAmount?: number;
  depositPaid?: boolean;
  /** Phần còn lại đã thanh toán qua VNPay (plan DEPOSIT) */
  balancePaid?: boolean;
  vnpayPaymentStatus?: "PENDING_PAYMENT" | "PAID" | "FAILED";
  vnpayAmountVnd?: number | null;
  paymentMethod?: PaymentMethod;
  shippingAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  /** Luồng shipping: thời điểm seller gửi xe (nếu có) */
  shippedAt?: string;
  /** Admin xác nhận xe tới kho */
  warehouseConfirmedAt?: string;
  /** Inspector đã kiểm định lại (orderId -> true) */
  reInspectionDoneAt?: string;
  expiresAt?: string; // ISO date
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOrderRequest = {
  listingId: string;
  plan: "DEPOSIT" | "FULL";
  shippingAddress: {
    street: string;
    city: string;
    postalCode?: string;
  };
  /** Bắt buộc khi mua xe chưa kiểm định */
  acceptedUnverifiedDisclaimer?: boolean;
};

export type InitiatePaymentRequest = {
  method: InitiatePaymentMethod;
  amount?: number;
};

export type Transaction = Order & {
  orderId: string;
  depositPaid?: number;
};
