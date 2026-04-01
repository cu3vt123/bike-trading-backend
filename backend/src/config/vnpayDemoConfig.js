/**
 * Cấu hình VNPAY Sandbox — module /payment + checkout buyer.
 * Ưu tiên tên biến theo spec; vẫn hỗ trợ tên cũ để tương thích.
 */

function normalizeEnvSecret(raw) {
  if (raw == null) return "";
  let s = String(raw).replace(/^\uFEFF/, "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function getVnpayDemoConfig() {
  const tmnCode =
    process.env.VNP_TMNCODE?.trim() ||
    process.env.VNP_TMN_CODE?.trim() ||
    process.env.VNPAY_TMN_CODE?.trim() ||
    "";
  const hashSecret = normalizeEnvSecret(
    process.env.VNP_HASHSECRET ||
      process.env.VNP_HASH_SECRET ||
      process.env.VNPAY_HASH_SECRET ||
      "",
  );
  const payUrl =
    process.env.VNP_PAYURL?.trim() ||
    process.env.VNP_PAY_URL?.trim() ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = process.env.VNP_RETURNURL?.trim() || "";
  const ipnUrl = process.env.VNP_IPNURL?.trim() || "";
  /** Mặc định NCB — bỏ qua màn chọn phương thức, đi thẳng thẻ nội địa/TK ngân hàng. Ghi đè bằng VNP_BANKCODE nếu muốn. */
  const bankCode =
    process.env.VNP_BANKCODE?.trim() ||
    process.env.VNP_BANK_CODE?.trim() ||
    "NCB";

  return {
    tmnCode,
    hashSecret,
    payUrl,
    returnUrl,
    ipnUrl,
    bankCode,
    isReady: Boolean(tmnCode && hashSecret && returnUrl),
  };
}
