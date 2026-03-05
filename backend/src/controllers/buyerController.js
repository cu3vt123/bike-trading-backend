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
});

export async function createOrder(req, res) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid order payload");

  const { listingId, plan, shippingAddress } = parsed.data;
  const buyerId = req.user.id;

  const listing = await Listing.findById(listingId);
  if (!listing) return notFound(res, "Listing not found");
  if (listing.state !== "PUBLISHED" || listing.inspectionResult !== "APPROVE") {
    return badRequest(res, "Listing not available for purchase");
  }

  const totalPrice = listing.price;
  const depositAmount = Math.round(totalPrice * 0.08);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await Listing.findByIdAndUpdate(listingId, { state: "RESERVED" });

  const order = await Order.create({
    buyerId,
    listingId: listing._id,
    status: "RESERVED",
    plan,
    totalPrice,
    depositAmount,
    depositPaid: true,
    shippingAddress: {
      street: shippingAddress.street || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
    },
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
  const buyerId = req.user.id;
  const orders = await Order.find({ buyerId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const items = orders.map((o) => {
    const obj = { ...o };
    obj.id = String(o._id);
    obj.listingId = String(o.listingId);
    obj.buyerId = String(o.buyerId);
    if (o.expiresAt) obj.expiresAt = o.expiresAt.toISOString();
    delete obj._id;
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
  if (order.status !== "RESERVED" && order.status !== "IN_TRANSACTION") {
    return badRequest(res, `Order cannot be completed (status: ${order.status})`);
  }

  order.status = "COMPLETED";
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { state: "SOLD" });

  const out = order.toJSON ? order.toJSON() : order;
  return ok(res, out);
}
