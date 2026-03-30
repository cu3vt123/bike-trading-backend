import mongoose from "mongoose";
import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { Order } from "../models/Order.js";
import {
  ok,
  created,
  badRequest,
  notFound,
  forbidden,
  serviceUnavailable,
} from "../utils/http.js";
import { buildVnpaySandboxPaymentUrl } from "../utils/vnpaySandbox.js";
import { getVnpayDemoConfig } from "../config/vnpayDemoConfig.js";
import { buildBuyerOrderVnpayTxnRef, buildBuyerBalanceVnpayTxnRef } from "../utils/vnpayBuyerTxnRef.js";

/** Giới hạn nghiệp vụ: tối đa 3 lần hủy đơn / buyer / cửa sổ 7 ngày (lăn). */
const CANCEL_LIMIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CANCELS_PER_7_DAYS = 3;

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "127.0.0.1";
}

const createOrderSchema = z.object({
  listingId: z.string().min(1),
  plan: z.enum(["DEPOSIT", "FULL"]),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string().optional(),
  }),
  /** Bắt buộc true nếu tin chưa kiểm định (UNVERIFIED) */
  acceptedUnverifiedDisclaimer: z.boolean().optional(),
});

/** Chưa có mác CERTIFIED → buyer phải chấp nhận disclaimer (xe chưa kiểm định). */
function listingNeedsUnverifiedDisclaimer(listing) {
  return listing.certificationStatus !== "CERTIFIED";
}

/**
 * Chỉ xe đã có mác kiểm định (CERTIFIED) mới gửi kho + admin xác nhận.
 * Xe UNVERIFIED / PENDING_CERTIFICATION → DIRECT, seller giao thẳng, không qua kho.
 */
function listingUsesWarehouseFlow(listing) {
  return listing.certificationStatus === "CERTIFIED";
}

/** Đặt mua xe chỉ qua VNPAY — POST /api/buyer/orders/vnpay-checkout (cọc hoặc full đều online). */
export async function createOrder(req, res) {
  return badRequest(
    res,
    "USE_VNPAY_CHECKOUT: Mua xe qua POST /api/buyer/orders/vnpay-checkout (cọc/full đều thanh toán online VNPAY).",
  );
}

/**
 * POST /api/buyer/orders/:id/vnpay-resume
 * Tạo lại URL VNPAY cho đơn cùng orderId (chưa thanh toán), không tạo đơn mới.
 */
export async function resumeBuyerOrderVnpay(req, res) {
  const { id } = req.params;
  const buyerId = req.user.id;

  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== buyerId) {
    return forbidden(res, "Not your order");
  }
  if (order.status === "CANCELLED") {
    return badRequest(res, "Order cancelled");
  }
  if (order.vnpayPaymentStatus !== "PENDING_PAYMENT") {
    return badRequest(res, "No pending VNPAY payment for this order");
  }
  if (order.vnpayAmountVnd == null) {
    return badRequest(res, "Order has no VNPAY amount");
  }

  const cfg = getVnpayDemoConfig();
  if (!cfg.isReady) {
    return serviceUnavailable(
      res,
      "VNPAY chưa cấu hình. Thêm VNP_TMNCODE, VNP_HASHSECRET, VNP_RETURNURL vào .env (tùy chọn VNP_PAYURL, VNP_IPNURL).",
    );
  }

  const txnRef = buildBuyerOrderVnpayTxnRef(order._id);
  const amountVnd = Math.round(Number(order.vnpayAmountVnd));
  let paymentUrl;
  try {
    paymentUrl = buildVnpaySandboxPaymentUrl({
      tmnCode: cfg.tmnCode,
      hashSecret: cfg.hashSecret,
      amountVnd,
      txnRef,
      orderInfo: `ShopBike don ${String(order._id).slice(-8)}`,
      returnUrl: cfg.returnUrl,
      ipAddr: clientIp(req),
      payUrl: cfg.payUrl,
      ipnUrl: cfg.ipnUrl || undefined,
      bankCode: cfg.bankCode,
    });
  } catch (e) {
    console.error("[buyer-vnpay-resume] build URL failed:", e?.message ?? e);
    return badRequest(res, "Không tạo được URL thanh toán VNPAY");
  }

  return ok(res, {
    paymentUrl,
    txnRef,
    orderId: String(order._id),
    vnpayAmountVnd: amountVnd,
  });
}

/**
 * POST /api/buyer/orders/vnpay-checkout
 * Tạo đơn (chưa trả tiền) + URL redirect VNPAY Sandbox. IPN sẽ gắn PAID / FAILED.
 */
export async function createOrderVnpayCheckout(req, res) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid order payload");

  const { listingId, plan, shippingAddress, acceptedUnverifiedDisclaimer } = parsed.data;
  const buyerId = req.user.id;

  const listing = await Listing.findById(listingId);
  if (!listing) return notFound(res, "Listing not found");
  if (listing.isHidden) return badRequest(res, "Listing has been hidden by admin");
  const now = new Date();
  if (listing.state !== "PUBLISHED") {
    return badRequest(res, "Listing not available for purchase");
  }
  if (listing.listingExpiresAt && listing.listingExpiresAt <= now) {
    return badRequest(res, "Listing has expired");
  }
  if (listingNeedsUnverifiedDisclaimer(listing) && acceptedUnverifiedDisclaimer !== true) {
    return badRequest(res, "UNVERIFIED_DISCLAIMER_REQUIRED");
  }

  const cfg = getVnpayDemoConfig();
  if (!cfg.isReady) {
    return serviceUnavailable(
      res,
      "VNPAY chưa cấu hình. Thêm VNP_TMNCODE, VNP_HASHSECRET, VNP_RETURNURL vào .env (tùy chọn VNP_PAYURL, VNP_IPNURL).",
    );
  }

  const totalPrice = listing.price;
  const depositAmount = Math.round(totalPrice * 0.08);
  const vnpayAmountVnd = plan === "DEPOSIT" ? depositAmount : totalPrice;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const useWarehouse = listingUsesWarehouseFlow(listing);

  let orderStatus = useWarehouse ? "RESERVED" : "PENDING_SELLER_SHIP";
  if (useWarehouse && listing.warehouseIntakeVerifiedAt) {
    orderStatus = "AT_WAREHOUSE_PENDING_ADMIN";
  }

  await Listing.findByIdAndUpdate(listingId, { state: "RESERVED" });

  const order = await Order.create({
    buyerId,
    listingId: listing._id,
    status: orderStatus,
    fulfillmentType: useWarehouse ? "WAREHOUSE" : "DIRECT",
    plan,
    totalPrice,
    depositAmount,
    depositPaid: false,
    vnpayPaymentStatus: "PENDING_PAYMENT",
    vnpayAmountVnd,
    shippingAddress: {
      street: shippingAddress.street || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
    },
    shippedAt: null,
    expiresAt,
    listing: {
      id: String(listing._id),
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      price: listing.price,
      currency: listing.currency,
      imageUrls: listing.imageUrls,
      thumbnailUrl: listing.thumbnailUrl,
      frameSize: listing.frameSize,
      condition: listing.condition,
      seller: listing.seller ? { id: String(listing.seller.id), name: listing.seller.name, email: listing.seller.email } : undefined,
    },
  });

  const txnRef = buildBuyerOrderVnpayTxnRef(order._id);
  let paymentUrl;
  try {
    paymentUrl = buildVnpaySandboxPaymentUrl({
      tmnCode: cfg.tmnCode,
      hashSecret: cfg.hashSecret,
      amountVnd: vnpayAmountVnd,
      txnRef,
      orderInfo: `ShopBike don ${String(order._id).slice(-8)}`,
      returnUrl: cfg.returnUrl,
      ipAddr: clientIp(req),
      payUrl: cfg.payUrl,
      ipnUrl: cfg.ipnUrl || undefined,
      bankCode: cfg.bankCode,
    });
  } catch (e) {
    console.error("[buyer-vnpay] build URL failed:", e?.message ?? e);
    await Order.findByIdAndDelete(order._id);
    await Listing.findByIdAndUpdate(listingId, { state: "PUBLISHED" });
    return badRequest(res, "Không tạo được URL thanh toán VNPAY");
  }

  const doc = order.toJSON ? order.toJSON() : {};
  const out = {
    id: String(order._id),
    listingId: String(listing._id),
    buyerId: String(order.buyerId),
    status: order.status,
    fulfillmentType: order.fulfillmentType ?? "WAREHOUSE",
    plan: order.plan,
    totalPrice,
    depositAmount,
    depositPaid: false,
    vnpayPaymentStatus: "PENDING_PAYMENT",
    vnpayAmountVnd,
    shippingAddress: {
      street: shippingAddress.street || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
    },
    expiresAt: expiresAt.toISOString(),
    listing: doc.listing,
    paymentUrl,
    txnRef,
  };

  return created(res, out);
}

export async function getMyOrders(req, res) {
  const buyerId = req.user?.id;
  if (!buyerId) return ok(res, []);

  if (!mongoose.isValidObjectId(buyerId)) return ok(res, []);
  const buyerObjectId = new mongoose.Types.ObjectId(buyerId);

  const orders = await Order.find({ buyerId: buyerObjectId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const items = orders.map((o) => {
    const obj = { ...o };
    obj.id = String(o._id);
    obj.listingId = String(o.listingId);
    obj.buyerId = String(o.buyerId);
    if (o.expiresAt) obj.expiresAt = o.expiresAt.toISOString?.() ?? o.expiresAt;
    if (o.shippedAt) obj.shippedAt = o.shippedAt.toISOString?.() ?? o.shippedAt;
    if (o.warehouseConfirmedAt) obj.warehouseConfirmedAt = o.warehouseConfirmedAt.toISOString?.() ?? o.warehouseConfirmedAt;
    if (o.reInspectionDoneAt) obj.reInspectionDoneAt = o.reInspectionDoneAt.toISOString?.() ?? o.reInspectionDoneAt;
    if (o.createdAt) obj.createdAt = o.createdAt.toISOString?.() ?? o.createdAt;
    if (o.updatedAt) obj.updatedAt = o.updatedAt.toISOString?.() ?? o.updatedAt;
    obj.fulfillmentType = o.fulfillmentType ?? "WAREHOUSE";
    delete obj._id;
    delete obj.__v;
    return obj;
  });

  return ok(res, items);
}

export async function getOrderById(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id).lean();
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== req.user.id) {
    return forbidden(res, "Not your order");
  }

  const obj = { ...order };
  obj.id = String(order._id);
  obj.listingId = String(order.listingId);
  obj.buyerId = String(order.buyerId);
  obj.fulfillmentType = order.fulfillmentType ?? "WAREHOUSE";
  if (order.expiresAt) obj.expiresAt = order.expiresAt.toISOString();
  delete obj._id;

  /** sellerId cần cho đánh giá — lấy từ Listing (Order không lưu sellerId) */
  if (!obj.sellerId && order.listingId) {
    const listing = await Listing.findById(order.listingId).select("seller").lean();
    if (listing?.seller?.id) obj.sellerId = String(listing.seller.id);
  }
  /** Bổ sung seller vào snapshot nếu thiếu (để Success page đánh giá) */
  if (!obj.listing?.seller && obj.sellerId) {
    obj.listing = obj.listing ? { ...obj.listing, seller: { id: obj.sellerId } } : { seller: { id: obj.sellerId } };
  }

  return ok(res, obj);
}

export async function completeOrder(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== req.user.id) {
    return forbidden(res, "Not your order");
  }
  if (order.status !== "SHIPPING") {
    const hint =
      order.fulfillmentType === "DIRECT"
        ? "Chỉ hoàn tất khi seller đã giao xe và đơn đang ở trạng thái đang giao (SHIPPING)."
        : "Chỉ hoàn tất khi xe đã qua kho, kiểm định lại và đang giao tới bạn (SHIPPING).";
    return badRequest(res, `${hint} (hiện tại: ${order.status})`);
  }

  order.status = "COMPLETED";
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { state: "SOLD" });

  const out = order.toJSON ? order.toJSON() : order;
  return ok(res, out);
}

/** POST /api/buyer/orders/:id/vnpay-pay-balance — thanh toán số dư qua VNPay (plan DEPOSIT) */
export async function payBalanceVnpay(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== req.user.id) {
    return forbidden(res, "Not your order");
  }
  if (order.plan !== "DEPOSIT") {
    return badRequest(res, "Chỉ đơn đặt cọc mới thanh toán số dư.");
  }
  if (order.status !== "SHIPPING") {
    return badRequest(res, "Chỉ thanh toán số dư khi đơn đang giao hàng (SHIPPING).");
  }
  if (order.balancePaid) {
    return badRequest(res, "Số dư đã thanh toán.");
  }
  const depositAmount = order.depositAmount ?? Math.round(order.totalPrice * 0.08);
  const balanceAmount = Math.max(0, order.totalPrice - depositAmount);
  if (balanceAmount <= 0) {
    return badRequest(res, "Không còn số dư cần thanh toán.");
  }

  const cfg = getVnpayDemoConfig();
  if (!cfg.isReady) {
    return serviceUnavailable(
      res,
      "VNPAY chưa cấu hình. Thêm VNP_TMNCODE, VNP_HASHSECRET, VNP_RETURNURL vào .env.",
    );
  }

  const txnRef = buildBuyerBalanceVnpayTxnRef(order._id);
  let paymentUrl;
  try {
    paymentUrl = buildVnpaySandboxPaymentUrl({
      tmnCode: cfg.tmnCode,
      hashSecret: cfg.hashSecret,
      amountVnd: balanceAmount,
      txnRef,
      orderInfo: `ShopBike so du don ${String(order._id).slice(-8)}`,
      returnUrl: cfg.returnUrl,
      ipAddr: clientIp(req),
      payUrl: cfg.payUrl,
      ipnUrl: cfg.ipnUrl || undefined,
      bankCode: cfg.bankCode,
    });
  } catch (e) {
    console.error("[buyer-pay-balance] build URL failed:", e?.message ?? e);
    return badRequest(res, "Không tạo được URL thanh toán VNPAY");
  }

  return ok(res, {
    paymentUrl,
    orderId: String(order._id),
    balanceAmount,
    txnRef,
  });
}

export async function cancelOrder(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== req.user.id) {
    return forbidden(res, "Not your order");
  }
  /** Cả DIRECT và WAREHOUSE: hủy được trước khi buyer xác nhận nhận hàng (COMPLETED) */
  const cancellableStatuses = [
    "RESERVED",
    "IN_TRANSACTION",
    "PENDING_SELLER_SHIP",
    "SELLER_SHIPPED",
    "AT_WAREHOUSE_PENDING_ADMIN",
    "RE_INSPECTION",
    "RE_INSPECTION_DONE",
    "SHIPPING",
  ];
  if (!cancellableStatuses.includes(order.status)) {
    return badRequest(res, `Không thể hủy đơn ở trạng thái ${order.status}.`);
  }

  const since = new Date(Date.now() - CANCEL_LIMIT_WINDOW_MS);
  const recentCancelCount = await Order.countDocuments({
    buyerId: order.buyerId,
    status: "CANCELLED",
    updatedAt: { $gte: since },
  });
  if (recentCancelCount >= MAX_CANCELS_PER_7_DAYS) {
    return badRequest(
      res,
      "Bạn đã đạt giới hạn hủy đơn: tối đa 3 lần trong 7 ngày. Vui lòng thử lại sau.",
      "CANCEL_LIMIT_REACHED",
    );
  }

  order.status = "CANCELLED";
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { state: "PUBLISHED" });

  const out = order.toJSON ? order.toJSON() : order;
  return ok(res, out);
}
