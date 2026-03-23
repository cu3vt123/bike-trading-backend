import crypto from "crypto";

/** Mặc định sandbox — có thể ghi đè bằng env VNP_PAY_URL */
const DEFAULT_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

/** Thời gian theo giờ VN (YYYYMMDDHHmmss) cho vnp_CreateDate */
function vnCompactDateTime() {
  const d = new Date();
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const vn = new Date(utcMs + 7 * 3600000);
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${vn.getUTCFullYear()}${p(vn.getUTCMonth() + 1)}${p(vn.getUTCDate())}` +
    `${p(vn.getUTCHours())}${p(vn.getUTCMinutes())}${p(vn.getUTCSeconds())}`
  );
}

function normalizeIp(ip) {
  if (!ip || typeof ip !== "string") return "127.0.0.1";
  const s = ip.replace(/^::ffff:/i, "").trim();
  return s.slice(0, 64) || "127.0.0.1";
}

/**
 * Tạo URL thanh toán sandbox VNPay (v2.1.0) có chữ ký HMAC SHA512.
 * @param {object} opts
 * @param {string} [opts.payUrl] — mặc định sandbox vpcpay.html hoặc VNP_PAY_URL
 * @param {string} [opts.ipnUrl] — VNP_IPNURL: VNPAY gọi server-to-server sau thanh toán (nếu cấu hình cổng merchant)
 * @see https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop
 */
/**
 * @param {object} opts
 * @param {string} [opts.bankCode] — vnp_BankCode: bỏ qua màn chọn phương thức, đi thẳng luồng thẻ nội địa/ngân hàng (NCB, TCB, VTB, …)
 */
export function buildVnpaySandboxPaymentUrl({
  tmnCode,
  hashSecret,
  amountVnd,
  txnRef,
  orderInfo,
  returnUrl,
  ipAddr,
  payUrl,
  ipnUrl,
  bankCode,
}) {
  const ref = String(txnRef).replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100);
  const info = String(orderInfo).slice(0, 255);
  /** VNPAY: số tiền × 100 (VND không có xu) */
  const amount = String(Math.round(Number(amountVnd)) * 100);

  const vnp = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: ref,
    vnp_OrderInfo: info,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: normalizeIp(ipAddr),
    vnp_CreateDate: vnCompactDateTime(),
  };

  /** Một số tài khoản sandbox cho phép truyền URL nhận IPN ngay trên request thanh toán */
  if (ipnUrl && String(ipnUrl).trim()) {
    vnp.vnp_IpnUrl = String(ipnUrl).trim();
  }

  /** Bỏ qua màn chọn phương thức (QR, thẻ QT, app) — đi thẳng luồng thẻ nội địa / TK ngân hàng */
  if (bankCode && String(bankCode).trim()) {
    vnp.vnp_BankCode = String(bankCode).trim();
  }

  /**
   * VNPAY kiểm tra chữ ký trên đúng chuỗi query đã mã hóa (RFC 3986 / URLSearchParams),
   * không phải chuỗi key=value thô. Nếu ký sai (vd. vnp_ReturnUrl còn http://…),
   * sandbox trả lỗi "Sai chữ ký" (code 70).
   * @see https://unpkg.com/vnpay@2.4.4/dist/chunk-MPWSK5WT.js (hash = HMAC(slice(1) của search đã encode))
   */
  const sortedKeys = Object.keys(vnp).sort();
  const params = new URLSearchParams();
  for (const k of sortedKeys) {
    params.append(k, vnp[k]);
  }
  const queryForSign = params.toString();
  const secureHash = crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(queryForSign, "utf-8"))
    .digest("hex");

  const base =
    (payUrl && String(payUrl).trim()) ||
    process.env.VNP_PAY_URL?.trim() ||
    DEFAULT_PAY_URL;
  return `${base}?${queryForSign}&vnp_SecureHash=${secureHash}`;
}

/**
 * Kiểm tra chữ ký VNPAY trên query Return URL / IPN.
 * Phải dùng cùng cách ký như lúc tạo URL thanh toán: sort key vnp_*,
 * bỏ hash, rồi HMAC trên chuỗi URLSearchParams (đã encode), không phải chuỗi thô.
 * @see vnpay npm verifyReturnUrl → buildPaymentUrlSearchParams + verifySecureHash
 */
export function verifyVnpaySecureHash(query, hashSecret) {
  if (!hashSecret || !query || typeof query !== "object") return false;
  const received = query.vnp_SecureHash ?? query.vnp_Securehash;
  if (!received || typeof received !== "string") return false;

  const data = { ...query };
  delete data.vnp_SecureHash;
  delete data.vnp_SecureHashType;

  const sortedKeys = Object.keys(data)
    .filter((k) => k.startsWith("vnp_"))
    .sort();
  const params = new URLSearchParams();
  for (const k of sortedKeys) {
    const v = data[k];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== undefined && item !== null && item !== "") {
          params.append(k, String(item));
        }
      }
      continue;
    }
    params.append(k, String(v));
  }
  const signData = params.toString();
  const expected = crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
  return expected.toLowerCase() === String(received).toLowerCase();
}
