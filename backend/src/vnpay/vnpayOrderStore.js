/**
 * Store đơn hàng giả lập (in-memory) cho demo học tập VNPAY.
 * Khởi động lại server → mất hết dữ liệu.
 *
 * Trạng thái: PENDING_PAYMENT | PAID | FAILED
 */

/** @typedef {"PENDING_PAYMENT"|"PAID"|"FAILED"} OrderStatus */

/** @type {Map<string, { orderCode: string, amountVnd: number, status: OrderStatus, txnRef: string, createdAt: string, paidAt?: string }>} */
const ordersByTxnRef = new Map();

/**
 * vnp_TxnRef phải khớp key lưu trữ để IPN / Return tìm được đơn.
 */
export function createDemoOrder({ orderCode, amountVnd, txnRef }) {
  const row = {
    orderCode,
    amountVnd: Math.round(Number(amountVnd)),
    status: "PENDING_PAYMENT",
    txnRef,
    createdAt: new Date().toISOString(),
  };
  ordersByTxnRef.set(txnRef, row);
  return row;
}

export function getOrderByTxnRef(txnRef) {
  return ordersByTxnRef.get(String(txnRef)) ?? null;
}

export function markPaid(txnRef) {
  const o = ordersByTxnRef.get(String(txnRef));
  if (!o) return null;
  o.status = "PAID";
  o.paidAt = new Date().toISOString();
  return o;
}

export function markFailed(txnRef) {
  const o = ordersByTxnRef.get(String(txnRef));
  if (!o) return null;
  o.status = "FAILED";
  return o;
}

/** Debug: xem tất cả đơn (không dùng production) */
export function listAllOrders() {
  return [...ordersByTxnRef.values()];
}
