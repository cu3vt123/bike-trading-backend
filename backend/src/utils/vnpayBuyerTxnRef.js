/**
 * Buyer Order trên VNPAY dùng vnp_TxnRef = "B" + 24 ký tự hex Mongo _id
 * (khác PackageOrder seller: TxnRef = _id thuần 24 hex).
 */
export function buildBuyerOrderVnpayTxnRef(orderId) {
  return `B${String(orderId)}`;
}

export function parseBuyerOrderVnpayTxnRef(txnRef) {
  const m = /^B([\da-f]{24})$/i.exec(String(txnRef ?? ""));
  return m ? m[1] : null;
}
