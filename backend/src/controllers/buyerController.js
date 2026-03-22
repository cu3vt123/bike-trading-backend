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
import { buildBuyerOrderVnpayTxnRef } from "../utils/vnpayBuyerTxnRef.js";

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

export async function cancelOrder(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== req.user.id) {
    return forbidden(res, "Not your order");
  }
  /** Cho phép hủy khi chưa qua bước seller đã gửi xe đi (chưa SELLER_SHIPPED trở đi), hoặc đơn VNPAY chưa thanh toán */
  const cancellable =
    order.vnpayPaymentStatus === "PENDING_PAYMENT" ||
    order.status === "RESERVED" ||
    order.status === "IN_TRANSACTION" ||
    order.status === "PENDING_SELLER_SHIP";
  if (!cancellable) {
    return badRequest(res, `Order cannot be cancelled (status: ${order.status})`);
  }
  if (order.vnpayPaymentStatus === "PAID" && order.depositPaid) {
    return badRequest(res, "Đơn đã thanh toán — không hủy qua API này.");
  }

  order.status = "CANCELLED";
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { state: "PUBLISHED" });

  const out = order.toJSON ? order.toJSON() : order;
  return ok(res, out);
}
