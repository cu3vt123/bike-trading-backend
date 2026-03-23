/**
 * VNPay: banner “đang bảo trì” trên checkout buyer + gói seller.
 * Mặc định: KHÔNG bảo trì (luồng VNPAY/QR hiển thị bình thường).
 * Chỉ bật banner khi ghi rõ `VITE_VNPAY_MAINTENANCE=true` (tắt cổng tạm thời).
 */
export const VNPAY_UI_MAINTENANCE =
  import.meta.env.VITE_VNPAY_MAINTENANCE === "true";

