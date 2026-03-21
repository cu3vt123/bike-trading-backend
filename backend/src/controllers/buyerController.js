import mongoose from "mongoose";
import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { Order } from "../models/Order.js";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";

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

function listingNeedsUnverifiedDisclaimer(listing) {
  if (listing.certificationStatus === "CERTIFIED") return false;
  if (listing.inspectionResult === "APPROVE") return false;
  return true;
}

/** Xe đã kiểm định → luồng kho; chưa kiểm định → giao trực tiếp, không qua kho */
function listingUsesWarehouseFlow(listing) {
  return !listingNeedsUnverifiedDisclaimer(listing);
}

export async function createOrder(req, res) {
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

  const totalPrice = listing.price;
  const depositAmount = Math.round(totalPrice * 0.08);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const useWarehouse = listingUsesWarehouseFlow(listing);

  await Listing.findByIdAndUpdate(listingId, { state: "RESERVED" });

  const order = await Order.create({
    buyerId,
    listingId: listing._id,
    status: useWarehouse ? "SELLER_SHIPPED" : "PENDING_SELLER_SHIP",
    fulfillmentType: useWarehouse ? "WAREHOUSE" : "DIRECT",
    plan,
    totalPrice,
    depositAmount,
    depositPaid: true,
    shippingAddress: {
      street: shippingAddress.street || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
    },
    shippedAt: useWarehouse ? new Date() : null,
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
    depositPaid: true,
    shippingAddress: { street: shippingAddress.street || "", city: shippingAddress.city || "", postalCode: shippingAddress.postalCode || "" },
    expiresAt: expiresAt.toISOString(),
    listing: doc.listing || {
      id: String(listing._id),
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      price: listing.price,
      currency: listing.currency,
    },
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
  const cancellable =
    order.status === "RESERVED" ||
    order.status === "IN_TRANSACTION" ||
    (order.status === "PENDING_SELLER_SHIP" && order.fulfillmentType === "DIRECT");
  if (!cancellable) {
    return badRequest(res, `Order cannot be cancelled (status: ${order.status})`);
  }

  order.status = "CANCELLED";
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { state: "PUBLISHED" });

  const out = order.toJSON ? order.toJSON() : order;
  return ok(res, out);
}
