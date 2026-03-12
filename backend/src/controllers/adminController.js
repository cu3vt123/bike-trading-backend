import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import { ok, badRequest, notFound } from "../utils/http.js";

/** Đơn chờ admin xác nhận xe tới kho (bao gồm COMPLETED chưa có warehouseConfirmedAt – hiển thị buyer là "Đang giao tới kho") */
const WAREHOUSE_PENDING_STATUSES = ["SELLER_SHIPPED", "AT_WAREHOUSE_PENDING_ADMIN"];
const WAREHOUSE_PENDING_QUERY = {
  $or: [
    { status: { $in: WAREHOUSE_PENDING_STATUSES } },
    { status: "COMPLETED", warehouseConfirmedAt: { $in: [null, undefined] } },
  ],
};

function serializeOrder(o) {
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
  delete obj._id;
  delete obj.__v;
  return obj;
}

function serializeUser(u) {
  const obj = { ...u };
  obj.id = String(u._id);
  if (u.createdAt) obj.createdAt = u.createdAt.toISOString?.() ?? u.createdAt;
  if (u.updatedAt) obj.updatedAt = u.updatedAt.toISOString?.() ?? u.updatedAt;
  if (u.hiddenAt) obj.hiddenAt = u.hiddenAt.toISOString?.() ?? u.hiddenAt;
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiresAt;
  return obj;
}

function serializeListing(l) {
  const obj = { ...l };
  obj.id = String(l._id);
  if (l.createdAt) obj.createdAt = l.createdAt.toISOString?.() ?? l.createdAt;
  if (l.updatedAt) obj.updatedAt = l.updatedAt.toISOString?.() ?? l.updatedAt;
  if (l.hiddenAt) obj.hiddenAt = l.hiddenAt.toISOString?.() ?? l.hiddenAt;
  delete obj._id;
  delete obj.__v;
  return obj;
}

export async function listWarehousePending(_req, res) {
  const orders = await Order.find(WAREHOUSE_PENDING_QUERY)
    .sort({ createdAt: -1 })
    .lean();

  const items = orders.map((o) => serializeOrder(o));
  return ok(res, items);
}

export async function confirmWarehouse(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");

  const canConfirm =
    WAREHOUSE_PENDING_STATUSES.includes(order.status) ||
    (order.status === "COMPLETED" && !order.warehouseConfirmedAt);
  if (!canConfirm) {
    return badRequest(res, `Order không ở trạng thái chờ xác nhận kho (status: ${order.status})`);
  }

  order.status = "RE_INSPECTION";
  order.warehouseConfirmedAt = new Date();
  await order.save();

  const out = serializeOrder(order.toObject ? order.toObject() : order);
  return ok(res, out);
}

export async function listReInspectionOrders(_req, res) {
  const orders = await Order.find({ status: "RE_INSPECTION" })
    .sort({ createdAt: -1 })
    .lean();

  const items = orders.map((o) => serializeOrder(o));
  return ok(res, items);
}

export async function markReInspectionDone(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");

  if (order.status !== "RE_INSPECTION") {
    return badRequest(res, `Order not in re-inspection (status: ${order.status})`);
  }

  const doneAt = new Date();
  order.status = "SHIPPING";
  order.reInspectionDoneAt = doneAt;
  order.expiresAt = new Date(doneAt.getTime() + 24 * 60 * 60 * 1000);
  await order.save();

  const out = serializeOrder(order.toObject ? order.toObject() : order);
  return ok(res, out);
}

export async function getAdminStats(_req, res) {
  const [totalUsers, totalBuyers, totalSellers, totalListings, totalOrders,
    ordersPendingWarehouse, ordersReInspection] = await Promise.all([
    User.countDocuments({ isHidden: { $ne: true } }),
    User.countDocuments({ role: "BUYER", isHidden: { $ne: true } }),
    User.countDocuments({ role: "SELLER", isHidden: { $ne: true } }),
    Listing.countDocuments({ isHidden: { $ne: true } }),
    Order.countDocuments({}),
    Order.countDocuments(WAREHOUSE_PENDING_QUERY),
    Order.countDocuments({ status: "RE_INSPECTION" }),
  ]);

  return ok(res, {
    totalUsers,
    totalBuyers,
    totalSellers,
    totalListings,
    totalOrders,
    ordersPendingWarehouse,
    ordersReInspection,
  });
}

export async function listUsers(_req, res) {
  const users = await User.find({ role: { $in: ["BUYER", "SELLER"] } })
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, users.map((u) => serializeUser(u)));
}

export async function hideUser(req, res) {
  const { id } = req.params;
  const actorId = req.user?.id;
  const user = await User.findById(id);
  if (!user) return notFound(res, "User not found");
  if (!["BUYER", "SELLER"].includes(user.role)) {
    return badRequest(res, "Only buyer/seller can be hidden");
  }
  if (String(user._id) === String(actorId)) {
    return badRequest(res, "Admin cannot hide self");
  }
  if (!user.isHidden) {
    user.isHidden = true;
    user.hiddenAt = new Date();
    await user.save();
  }
  return ok(res, serializeUser(user.toObject ? user.toObject() : user));
}

export async function unhideUser(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return notFound(res, "User not found");
  if (user.isHidden) {
    user.isHidden = false;
    user.hiddenAt = null;
    await user.save();
  }
  return ok(res, serializeUser(user.toObject ? user.toObject() : user));
}

export async function listListings(_req, res) {
  const listings = await Listing.find({})
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  return ok(res, listings.map((l) => serializeListing(l)));
}

export async function hideListing(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (!listing.isHidden) {
    listing.isHidden = true;
    listing.hiddenAt = new Date();
    await listing.save();
  }
  return ok(res, serializeListing(listing.toObject ? listing.toObject() : listing));
}

export async function unhideListing(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (listing.isHidden) {
    listing.isHidden = false;
    listing.hiddenAt = null;
    await listing.save();
  }
  return ok(res, serializeListing(listing.toObject ? listing.toObject() : listing));
}


