/**
 * Demo thanh toán VNPAY Sandbox — chuẩn học tập:
 * POST /payment/create      → tạo đơn + URL có chữ ký
 * GET  /payment/vnpay-return → trình duyệt quay lại sau thanh toán
 * GET  /payment/vnpay-ipn   → VNPAY server gọi (IPN), cập nhật trạng thái đơn
 */
import { z } from "zod";
import {
  buildVnpaySandboxPaymentUrl,
  verifyVnpaySecureHash,
} from "../utils/vnpaySandbox.js";
import { getVnpayDemoConfig } from "../config/vnpayDemoConfig.js";
import {
  createDemoOrder,
  getOrderByTxnRef,
  markPaid,
  markFailed,
} from "../vnpay/vnpayOrderStore.js";
import { PackageOrder } from "../models/PackageOrder.js";
import { Order } from "../models/Order.js";
import { Listing } from "../models/Listing.js";
import { activateSubscription } from "../services/subscriptionService.js";
import { parseBuyerOrderVnpayTxnRef, parseBuyerBalanceTxnRef } from "../utils/vnpayBuyerTxnRef.js";

/** TxnRef đơn gói seller = Mongo ObjectId (24 ký tự hex) */
function looksLikePackageOrderTxnRef(txnRef) {
  return typeof txnRef === "string" && /^[\da-f]{24}$/i.test(txnRef);
}

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "127.0.0.1";
}

/** Sinh mã đơn + TxnRef duy nhất (ký tự an toàn cho VNPAY) */
function makeTxnRef() {
  const t = Date.now();
  const r = Math.random().toString(36).slice(2, 10);
  return `DEMO${t}${r}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 100);
}

const createBodySchema = z.object({
  /** Số tiền VND (ví dụ 100000) — backend sẽ nhân 100 khi gửi VNPAY */
  amount: z.number().int().positive(),
  /** Hiển thị trên cổng VNPAY (tùy chọn) */
  orderInfo: z.string().max(240).optional(),
});

/**
 * POST /payment/create
 * Body: { "amount": 100000 }
 */
export async function vnpayCreatePayment(req, res) {
  const cfg = getVnpayDemoConfig();
  if (!cfg.isReady) {
    return res.status(503).json({
      ok: false,
      error:
        "Thiếu cấu hình VNPAY. Thêm VNP_TMNCODE, VNP_HASHSECRET, VNP_RETURNURL vào .env (tùy chọn VNP_PAYURL, VNP_IPNURL).",
    });
  }

  const parsed = createBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "amount phải là số nguyên dương (VND)" });
  }

  const { amount: amountVnd, orderInfo: orderInfoOpt } = parsed.data;
  const txnRef = makeTxnRef();
  const orderCode = txnRef;

  createDemoOrder({ orderCode, amountVnd, txnRef });

  const orderInfoText =
    (orderInfoOpt && String(orderInfoOpt).trim()) || `Thanh toan don ${orderCode}`;

  let paymentUrl;
  try {
    paymentUrl = buildVnpaySandboxPaymentUrl({
      tmnCode: cfg.tmnCode,
      hashSecret: cfg.hashSecret,
      amountVnd,
      txnRef,
      orderInfo: orderInfoText,
      returnUrl: cfg.returnUrl,
      ipAddr: clientIp(req),
      payUrl: cfg.payUrl,
      ipnUrl: cfg.ipnUrl || undefined,
      bankCode: cfg.bankCode,
    });
  } catch (e) {
    console.error("[vnpay-demo] build URL failed:", e?.message ?? e);
    return res.status(500).json({ ok: false, error: "Không tạo được URL thanh toán" });
  }

  return res.json({
    ok: true,
    orderCode,
    txnRef,
    amountVnd,
    status: "PENDING_PAYMENT",
    paymentUrl,
  });
}

/** Redirect về frontend sau khi user thanh toán xong trên cổng VNPAY */
function frontendResultBase() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
}

/**
 * GET /payment/vnpay-return
 * VNPAY redirect browser tới đây kèm query ?vnp_Amount=...&vnp_SecureHash=...
 * Nhiệm vụ: kiểm tra chữ ký → redirect sang SPA hiển thị kết quả (IPN mới là nơi “chốt” PAID tin cậy).
 */
export async function vnpayReturn(req, res) {
  const cfg = getVnpayDemoConfig();
  const q = req.query;
  const base = frontendResultBase();

  if (!cfg.hashSecret) {
    return res.redirect(
      `${base}/payment/vnpay-result?gate=return&ok=0&reason=config`,
    );
  }

  const valid = verifyVnpaySecureHash(q, cfg.hashSecret);
  if (!valid) {
    return res.redirect(
      `${base}/payment/vnpay-result?gate=return&ok=0&reason=checksum`,
    );
  }

  const txnRef = String(q.vnp_TxnRef ?? "");
  const responseCode = String(q.vnp_ResponseCode ?? "");

  /** Đơn mua gói seller: quay về SPA /seller/packages (IPN mới chốt COMPLETED + kích hoạt gói) */
  if (looksLikePackageOrderTxnRef(txnRef)) {
    const pkg = await PackageOrder.findById(txnRef).select("_id").lean();
    if (pkg) {
      const sp = new URLSearchParams({
        vnpay: "1",
        ok: responseCode === "00" ? "1" : "0",
        orderId: txnRef,
        vnp_ResponseCode: responseCode,
        vnp_TransactionStatus: String(q.vnp_TransactionStatus ?? ""),
      });
      return res.redirect(`${base}/seller/packages?${sp.toString()}`);
    }
  }

  /** Thanh toán số dư (BB + orderId) → redirect về Finalize */
  const balanceOid = parseBuyerBalanceTxnRef(txnRef);
  if (balanceOid) {
    const mo = await Order.findById(balanceOid);
    if (mo) {
      if (responseCode === "00") {
        mo.balancePaid = true;
        await mo.save();
      }
      const lid = String(mo.listingId ?? "");
      const sp = new URLSearchParams({
        orderId: balanceOid,
        vnpay_balance: responseCode === "00" ? "1" : "0",
      });
      return res.redirect(`${base}/finalize/${lid}?${sp.toString()}`);
    }
  }

  const buyerOid = parseBuyerOrderVnpayTxnRef(txnRef);
  if (buyerOid) {
    const mo = await Order.findById(buyerOid);
    if (mo) {
      /** Khi user quay lại từ VNPAY với mã thành công: cập nhật trạng thái ngay (IPN có thể không gọi được localhost). */
      if (responseCode === "00" && mo.vnpayPaymentStatus === "PENDING_PAYMENT") {
        mo.depositPaid = true;
        mo.vnpayPaymentStatus = "PAID";
        await mo.save();
      }
      const sp = new URLSearchParams({
        gate: "buyer",
        ok: responseCode === "00" ? "1" : "0",
        orderId: buyerOid,
        listingId: String(mo.listingId ?? ""),
        orderCode: txnRef,
        vnp_ResponseCode: responseCode,
        vnp_TransactionStatus: String(q.vnp_TransactionStatus ?? ""),
      });
      return res.redirect(`${base}/payment/vnpay-result?${sp.toString()}`);
    }
  }

  const order = getOrderByTxnRef(txnRef);

  const params = new URLSearchParams({
    gate: "return",
    ok: responseCode === "00" ? "1" : "0",
    orderCode: order?.orderCode ?? txnRef,
    vnp_ResponseCode: responseCode,
    vnp_TransactionStatus: String(q.vnp_TransactionStatus ?? ""),
  });

  return res.redirect(`${base}/payment/vnpay-result?${params.toString()}`);
}

/**
 * GET /payment/vnpay-ipn
 * VNPAY gọi từ server của họ → phải là URL public (ngrok trỏ vào backend).
 * Trả JSON đúng format VNPAY yêu cầu.
 */
export async function vnpayIpn(req, res) {
  const cfg = getVnpayDemoConfig();
  const q = req.query;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!cfg.hashSecret) {
    return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
  }

  if (!verifyVnpaySecureHash(q, cfg.hashSecret)) {
    return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
  }

  const txnRef = String(q.vnp_TxnRef ?? "");
  const amountFromVnp = parseInt(String(q.vnp_Amount ?? "0"), 10);
  const responseCode = String(q.vnp_ResponseCode ?? "");
  const transactionStatus = String(q.vnp_TransactionStatus ?? "");

  /** Đơn gói seller (Mongo PackageOrder) */
  if (looksLikePackageOrderTxnRef(txnRef)) {
    const pkgOrder = await PackageOrder.findById(txnRef);
    if (pkgOrder) {
      const expected = pkgOrder.amountVnd * 100;
      if (Number.isNaN(amountFromVnp) || amountFromVnp !== expected) {
        return res.status(200).json({ RspCode: "04", Message: "Invalid Amount" });
      }
      if (pkgOrder.status === "COMPLETED") {
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      if (responseCode === "00" && transactionStatus === "00") {
        pkgOrder.status = "COMPLETED";
        await pkgOrder.save();
        await activateSubscription(pkgOrder.sellerId, pkgOrder.plan);
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      if (pkgOrder.status === "PENDING") {
        pkgOrder.status = "FAILED";
        await pkgOrder.save();
      }
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    }
  }

  /** Thanh toán số dư (BB + orderId) */
  const balanceOid = parseBuyerBalanceTxnRef(txnRef);
  if (balanceOid) {
    const mo = await Order.findById(balanceOid);
    if (mo && mo.plan === "DEPOSIT") {
      const depositAmt = mo.depositAmount ?? Math.round(mo.totalPrice * 0.08);
      const expectedBalance = Math.max(0, mo.totalPrice - depositAmt);
      const expected = expectedBalance * 100;
      if (Number.isNaN(amountFromVnp) || amountFromVnp !== expected) {
        return res.status(200).json({ RspCode: "04", Message: "Invalid Amount" });
      }
      if (mo.balancePaid) {
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      if (responseCode === "00" && transactionStatus === "00") {
        mo.balancePaid = true;
        await mo.save();
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
    }
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  }

  /** Đơn mua xe buyer (Mongo Order, TxnRef = B + _id) */
  const buyerOid = parseBuyerOrderVnpayTxnRef(txnRef);
  if (buyerOid) {
    const mo = await Order.findById(buyerOid);
    if (mo && mo.vnpayAmountVnd != null) {
      const expected = Math.round(Number(mo.vnpayAmountVnd)) * 100;
      if (Number.isNaN(amountFromVnp) || amountFromVnp !== expected) {
        return res.status(200).json({ RspCode: "04", Message: "Invalid Amount" });
      }
      if (mo.vnpayPaymentStatus === "PAID" && mo.depositPaid) {
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      if (responseCode === "00" && transactionStatus === "00") {
        mo.depositPaid = true;
        mo.vnpayPaymentStatus = "PAID";
        await mo.save();
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      if (mo.vnpayPaymentStatus === "PENDING_PAYMENT") {
        mo.vnpayPaymentStatus = "FAILED";
        mo.status = "CANCELLED";
        await mo.save();
        await Listing.findByIdAndUpdate(mo.listingId, { state: "PUBLISHED" });
      }
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    }
  }

  const order = getOrderByTxnRef(txnRef);
  if (!order) {
    return res.status(200).json({ RspCode: "01", Message: "Order not Found" });
  }

  const expectedDemo = order.amountVnd * 100;
  if (Number.isNaN(amountFromVnp) || amountFromVnp !== expectedDemo) {
    return res.status(200).json({ RspCode: "04", Message: "Invalid Amount" });
  }

  /** IPN có thể bị gọi lại — đơn đã PAID thì chỉ xác nhận lại */
  if (order.status === "PAID") {
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  }

  if (responseCode === "00" && transactionStatus === "00") {
    markPaid(txnRef);
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  }

  if (order.status === "PENDING_PAYMENT") {
    markFailed(txnRef);
  }
  /** Vẫn trả 00: đã nhận và xử lý thông báo (giao dịch không thành công cũng ghi nhận) */
  return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
}
