import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import { PackageOrder } from "../models/PackageOrder.js";
import { ok, badRequest, notFound } from "../utils/http.js";
import { LISTING_DURATION_DAYS } from "../constants/subscription.js";
import {
  buildSubscriptionSummaryForUser,
  clearSellerSubscription,
} from "../services/subscriptionService.js";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializePackageOrder(o) {
  const row = {
    id: String(o._id),
    sellerId: String(o.sellerId),
    plan: o.plan,
    provider: o.provider,
    amountVnd: o.amountVnd,
    status: o.status,
  };
  if (o.createdAt) row.createdAt = o.createdAt.toISOString?.() ?? o.createdAt;
  return row;
}

/**
 * Chỉ đơn luồng kho (fulfillment WAREHOUSE — chỉ tạo khi listing đã CERTIFIED).
 * Đơn DIRECT không hiện ở kho / re-inspection.
 * listWarehousePending còn lọc thêm: listing phải CERTIFIED (tránh dữ liệu legacy sai).
 */
const WAREHOUSE_ONLY_FILTER = {
  $or: [
    { fulfillmentType: { $exists: false } },
    { fulfillmentType: "WAREHOUSE" },
  ],
};

/** Đơn chờ admin xác nhận xe tới kho (bao gồm COMPLETED chưa có warehouseConfirmedAt – hiển thị buyer là "Đang giao tới kho") */
const WAREHOUSE_PENDING_STATUSES = ["SELLER_SHIPPED", "AT_WAREHOUSE_PENDING_ADMIN"];
const WAREHOUSE_PENDING_QUERY = {
  $and: [
    WAREHOUSE_ONLY_FILTER,
    {
      $or: [
        { status: { $in: WAREHOUSE_PENDING_STATUSES } },
        { status: "COMPLETED", warehouseConfirmedAt: { $in: [null, undefined] } },
      ],
    },
  ],
};

const RE_INSPECTION_QUERY = {
  $and: [WAREHOUSE_ONLY_FILTER, { status: "RE_INSPECTION" }],
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

/** Chỉ đơn mà tin đăng vẫn đang CERTIFIED mới được coi là luồng kho hợp lệ. */
async function filterOrdersWithCertifiedListing(orders) {
  if (!orders.length) return [];
  const listingIds = [...new Set(orders.map((o) => String(o.listingId)))];
  const certifiedRows = await Listing.find({
    _id: { $in: listingIds },
    certificationStatus: "CERTIFIED",
  })
    .select("_id")
    .lean();
  const certifiedSet = new Set(certifiedRows.map((l) => String(l._id)));
  return orders.filter((o) => certifiedSet.has(String(o.listingId)));
}

export async function listWarehousePending(_req, res) {
  const orders = await Order.find(WAREHOUSE_PENDING_QUERY)
    .sort({ createdAt: -1 })
    .lean();

  const filtered = await filterOrdersWithCertifiedListing(orders);
  const items = filtered.map((o) => serializeOrder(o));
  return ok(res, items);
}

export async function confirmWarehouse(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return notFound(res, "Order not found");
  if (order.fulfillmentType === "DIRECT") {
    return badRequest(res, "Đơn giao trực tiếp không qua kho");
  }

  const listing = await Listing.findById(order.listingId).select("certificationStatus").lean();
  if (!listing || listing.certificationStatus !== "CERTIFIED") {
    return badRequest(
      res,
      "Chỉ xe đã có mác kiểm định (CERTIFIED) mới xác nhận tại kho. Xe chưa kiểm định chỉ giao trực tiếp.",
    );
  }

  const canConfirm =
    WAREHOUSE_PENDING_STATUSES.includes(order.status) ||
    (order.status === "COMPLETED" && !order.warehouseConfirmedAt);
  if (!canConfirm) {
    return badRequest(res, `Order không ở trạng thái chờ xác nhận kho (status: ${order.status})`);
  }

  if (
    order.status === "AT_WAREHOUSE_PENDING_ADMIN" &&
    !order.depositPaid &&
    order.vnpayPaymentStatus !== "PAID"
  ) {
    return badRequest(res, "Buyer chưa thanh toán (VNPAY), không thể xác nhận giao");
  }

  /** Xe đã kiểm định tại kho (AT_WAREHOUSE_PENDING_ADMIN): xác nhận bắt đầu giao → SHIPPING.
   * SELLER_SHIPPED (legacy): seller gửi kho → RE_INSPECTION rồi inspector xác nhận. */
  const doneAt = new Date();
  if (order.status === "AT_WAREHOUSE_PENDING_ADMIN") {
    order.status = "SHIPPING";
    order.warehouseConfirmedAt = doneAt;
    order.shippedAt = doneAt;
    order.expiresAt = new Date(doneAt.getTime() + 24 * 60 * 60 * 1000);
  } else {
    order.status = "RE_INSPECTION";
    order.warehouseConfirmedAt = doneAt;
  }
  await order.save();

  const out = serializeOrder(order.toObject ? order.toObject() : order);
  return ok(res, out);
}

export async function listReInspectionOrders(_req, res) {
  const orders = await Order.find(RE_INSPECTION_QUERY)
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
  if (order.fulfillmentType === "DIRECT") {
    return badRequest(res, "Direct fulfillment orders are not re-inspected at warehouse");
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
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    totalListings,
    totalOrders,
    ordersReInspection,
    listingsPendingWarehouseIntake,
  ] = await Promise.all([
    User.countDocuments({ isHidden: { $ne: true } }),
    User.countDocuments({ role: "BUYER", isHidden: { $ne: true } }),
    User.countDocuments({ role: "SELLER", isHidden: { $ne: true } }),
    Listing.countDocuments({ isHidden: { $ne: true } }),
    Order.countDocuments({}),
    Order.countDocuments(RE_INSPECTION_QUERY),
    Listing.countDocuments({
      state: { $in: ["AT_WAREHOUSE_PENDING_VERIFY", "AT_WAREHOUSE_PENDING_RE_INSPECTION"] },
      isHidden: { $ne: true },
    }),
  ]);

  return ok(res, {
    totalUsers,
    totalBuyers,
    totalSellers,
    totalListings,
    totalOrders,
    ordersPendingWarehouse: 0,
    ordersReInspection,
    listingsPendingWarehouseIntake,
  });
}

/** Tin kiểm định: AT_WAREHOUSE_PENDING_VERIFY (admin xác nhận xe tới) + AT_WAREHOUSE_PENDING_RE_INSPECTION (inspector xác nhận lần 2). */
const WAREHOUSE_INTAKE_STATES = ["AT_WAREHOUSE_PENDING_VERIFY", "AT_WAREHOUSE_PENDING_RE_INSPECTION"];

export async function listWarehouseIntakePending(_req, res) {
  const listings = await Listing.find({
    state: { $in: WAREHOUSE_INTAKE_STATES },
    isHidden: { $ne: true },
  })
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
  return ok(res, listings.map((l) => serializeListing(l)));
}

/** Bước 5: Admin xác nhận xe đã tới kho → chuyển chờ inspector xác nhận lần 2. */
export async function confirmWarehouseIntake(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (listing.state !== "AT_WAREHOUSE_PENDING_VERIFY") {
    return badRequest(res, "Tin không ở trạng thái chờ xác nhận xe tại kho.");
  }

  listing.state = "AT_WAREHOUSE_PENDING_RE_INSPECTION";
  await listing.save();
  return ok(res, serializeListing(listing.toObject ? listing.toObject() : listing));
}

/** Bước 6: Inspector xác nhận tại kho — approve → PUBLISHED+CERTIFIED, need_update → NEED_UPDATE. */
export async function confirmWarehouseReInspection(req, res) {
  const { id } = req.params;
  const { action, reason } = req.body || {};
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (listing.state !== "AT_WAREHOUSE_PENDING_RE_INSPECTION") {
    return badRequest(res, "Tin không ở trạng thái chờ inspector xác nhận tại kho.");
  }

  if (action === "need_update") {
    listing.state = "NEED_UPDATE";
    listing.inspectionResult = "NEED_UPDATE";
    listing.inspectionNeedUpdateReason = reason || "Yêu cầu cập nhật sau kiểm tra tại kho.";
    await listing.save();
    return ok(res, serializeListing(listing.toObject ? listing.toObject() : listing));
  }

  // approve
  const pubAt = new Date();
  listing.state = "PUBLISHED";
  listing.certificationStatus = "CERTIFIED";
  listing.warehouseIntakeVerifiedAt = pubAt;
  listing.publishedAt = pubAt;
  listing.listingExpiresAt = new Date(
    pubAt.getTime() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );
  await listing.save();
  return ok(res, serializeListing(listing.toObject ? listing.toObject() : listing));
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

/**
 * GET /api/admin/seller-subscriptions?q=&limit=
 * Danh sách seller + tóm tắt gói + vài đơn PackageOrder gần nhất.
 */
export async function listSellerSubscriptions(req, res) {
  const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1), 200);

  const filter = { role: "SELLER" };
  if (qRaw) {
    const rx = new RegExp(escapeRegex(qRaw), "i");
    filter.$or = [{ email: rx }, { displayName: rx }];
  }

  const sellers = await User.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
  const sellerIds = sellers.map((s) => s._id);

  const allOrders = await PackageOrder.find({ sellerId: { $in: sellerIds } })
    .sort({ createdAt: -1 })
    .limit(Math.min(2000, limit * 30))
    .lean();

  const recentBySeller = new Map();
  for (const o of allOrders) {
    const sid = String(o.sellerId);
    if (!recentBySeller.has(sid)) recentBySeller.set(sid, []);
    const arr = recentBySeller.get(sid);
    if (arr.length < 8) arr.push(serializePackageOrder(o));
  }

  const items = await Promise.all(
    sellers.map(async (u) => {
      const subscription = await buildSubscriptionSummaryForUser(u);
      return {
        user: serializeUser(u),
        subscription,
        recentPackageOrders: recentBySeller.get(String(u._id)) ?? [],
      };
    }),
  );

  return ok(res, items);
}

/** PUT /api/admin/users/:id/revoke-subscription — gỡ gói đăng tin (chỉ role SELLER) */
export async function revokeSellerSubscription(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return notFound(res, "User not found");
  if (user.role !== "SELLER") {
    return badRequest(res, "Chỉ có thể gỡ gói cho tài khoản seller");
  }

  const hadPlan = Boolean(user.subscriptionPlan || user.subscriptionExpiresAt);
  if (hadPlan) {
    await clearSellerSubscription(id);
  }

  const updated = await User.findById(id);
  const subscription = await buildSubscriptionSummaryForUser(updated);
  return ok(res, {
    user: serializeUser(updated.toObject ? updated.toObject() : updated),
    subscription,
    revoked: hadPlan,
  });
}


