import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";
import { LISTING_DURATION_DAYS } from "../constants/subscription.js";
import {
  isSubscriptionActive,
  countActiveListingSlots,
  getSlotsLimit,
} from "../services/subscriptionService.js";

function normalizeListing(doc) {
  return doc.toJSON();
}

export async function dashboard(req, res) {
  const sellerId = req.user.id;
  const listings = await Listing.find({ "seller.id": sellerId })
    .sort({ updatedAt: -1 })
    .limit(200);

  const stats = {
    total: listings.length,
    published: listings.filter((l) => l.state === "PUBLISHED").length,
    inReview: listings.filter((l) => l.state === "PENDING_INSPECTION").length,
    needUpdate: listings.filter((l) => l.state === "NEED_UPDATE").length,
  };

  return ok(res, { stats, listings: listings.map(normalizeListing) });
}

export async function listMyListings(req, res) {
  const sellerId = req.user.id;
  const listings = await Listing.find({ "seller.id": sellerId })
    .sort({ updatedAt: -1 })
    .limit(200);
  return res.status(200).json({ content: listings.map(normalizeListing) });
}

export async function getMyListing(req, res) {
  const sellerId = req.user.id;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (String(listing.seller.id) !== String(sellerId)) return forbidden(res, "Not your listing");
  return ok(res, normalizeListing(listing));
}

export async function createListing(req, res) {
  if (!isSubscriptionActive(req.user)) {
    return forbidden(res, "PACKAGE_REQUIRED");
  }

  const schema = z.object({
    title: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().optional(),
    year: z.number().int().optional(),
    price: z.number().nonnegative(),
    currency: z.string().optional(),
    frameSize: z.string().optional(),
    condition: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid listing payload");

  const sellerId = req.user.id;
  const sellerName = req.user.displayName ?? "";
  const sellerEmail = req.user.email ?? "";

  const listing = await Listing.create({
    ...parsed.data,
    state: "DRAFT",
    inspectionResult: null,
    certificationStatus: "UNVERIFIED",
    seller: { id: sellerId, name: sellerName, email: sellerEmail },
  });

  return created(res, normalizeListing(listing));
}

/**
 * Đăng tin lên sàn: requestInspection=false → PUBLISHED + UNVERIFIED (30 ngày).
 * requestInspection=true → PENDING_INSPECTION + PENDING_CERTIFICATION (kiểm định tùy chọn).
 */
export async function publishListing(req, res) {
  if (!isSubscriptionActive(req.user)) {
    return forbidden(res, "PACKAGE_REQUIRED");
  }

  const bodySchema = z.object({
    requestInspection: z.boolean().optional().default(false),
  });
  const parsedBody = bodySchema.safeParse(req.body ?? {});
  if (!parsedBody.success) return badRequest(res, "Invalid publish payload");

  const sellerId = req.user.id;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (String(listing.seller.id) !== String(sellerId)) return forbidden(res, "Not your listing");

  if (listing.state === "PENDING_INSPECTION") {
    return badRequest(res, "Listing is locked pending inspection");
  }
  if (["RESERVED", "IN_TRANSACTION", "SOLD"].includes(listing.state)) {
    return badRequest(res, "Cannot publish listing in current state");
  }
  /** Cho phép đăng lại sau NEED_UPDATE hoặc từ DRAFT */
  if (!["DRAFT", "NEED_UPDATE"].includes(listing.state)) {
    return badRequest(res, "Cannot publish listing in current state");
  }

  const { requestInspection } = parsedBody.data;

  if (requestInspection) {
    if (!listing.imageUrls || listing.imageUrls.length === 0) {
      return badRequest(res, "At least 1 photo is required");
    }
    listing.state = "PENDING_INSPECTION";
    listing.certificationStatus = "PENDING_CERTIFICATION";
    listing.inspectionResult = null;
    listing.publishedAt = null;
    listing.listingExpiresAt = null;
  } else {
    const used = await countActiveListingSlots(sellerId);
    const limit = getSlotsLimit(req.user.subscriptionPlan);
    if (used >= limit) {
      return badRequest(res, "LISTING_SLOT_LIMIT");
    }
    if (!listing.imageUrls || listing.imageUrls.length === 0) {
      return badRequest(res, "At least 1 photo is required");
    }
    const now = new Date();
    listing.state = "PUBLISHED";
    listing.certificationStatus = "UNVERIFIED";
    listing.inspectionResult = null;
    listing.publishedAt = now;
    listing.listingExpiresAt = new Date(
      now.getTime() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );
  }

  await listing.save();
  return ok(res, normalizeListing(listing));
}

export async function updateListing(req, res) {
  const schema = z.object({
    title: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
    price: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    frameSize: z.string().optional(),
    condition: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid update payload");

  const sellerId = req.user.id;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (String(listing.seller.id) !== String(sellerId)) return forbidden(res, "Not your listing");

  // Demo rule: cannot edit when pending inspection
  if (listing.state === "PENDING_INSPECTION") {
    return badRequest(res, "Listing is locked pending inspection");
  }

  Object.assign(listing, parsed.data);
  await listing.save();
  return ok(res, normalizeListing(listing));
}

/** Đơn hàng cần seller gửi xe tới kho (SELLER_SHIPPED = buyer đã mua, chờ seller gửi) */
export async function listMyOrders(req, res) {
  const sellerId = req.user.id;
  const listings = await Listing.find({ "seller.id": sellerId }).select("_id").lean();
  const listingIds = listings.map((l) => l._id);
  if (listingIds.length === 0) return ok(res, []);

  const orders = await Order.find({
    listingId: { $in: listingIds },
    $or: [
      {
        status: { $in: ["SELLER_SHIPPED", "AT_WAREHOUSE_PENDING_ADMIN"] },
        fulfillmentType: { $ne: "DIRECT" },
      },
      { status: "PENDING_SELLER_SHIP", fulfillmentType: "DIRECT" },
    ],
  })
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
    if (o.createdAt) obj.createdAt = o.createdAt.toISOString?.() ?? o.createdAt;
    if (o.updatedAt) obj.updatedAt = o.updatedAt.toISOString?.() ?? o.updatedAt;
    obj.fulfillmentType = o.fulfillmentType ?? "WAREHOUSE";
    delete obj._id;
    delete obj.__v;
    return obj;
  });

  return ok(res, items);
}

/** Seller xác nhận đã giao xe trực tiếp cho buyer (chỉ đơn DIRECT, chưa kiểm định). */
export async function shipDirectToBuyer(req, res) {
  const sellerId = req.user.id;
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return notFound(res, "Order not found");
  const listing = await Listing.findById(order.listingId);
  if (!listing) return notFound(res, "Listing not found");
  if (String(listing.seller.id) !== String(sellerId)) return forbidden(res, "Not your order");

  if (order.fulfillmentType !== "DIRECT") {
    return badRequest(res, "Chỉ áp dụng cho đơn giao trực tiếp (xe chưa kiểm định). Với xe đã kiểm định, vui lòng gửi về kho.");
  }
  if (order.status !== "PENDING_SELLER_SHIP") {
    return badRequest(res, `Không thể xác nhận giao hàng (trạng thái: ${order.status})`);
  }

  const shippedAt = new Date();
  order.status = "SHIPPING";
  order.shippedAt = shippedAt;
  order.expiresAt = new Date(shippedAt.getTime() + 24 * 60 * 60 * 1000);
  await order.save();

  const o = order.toObject ? order.toObject() : order;
  const obj = { ...o };
  obj.id = String(order._id);
  obj.listingId = String(order.listingId);
  obj.buyerId = String(order.buyerId);
  obj.fulfillmentType = order.fulfillmentType ?? "DIRECT";
  if (order.expiresAt) obj.expiresAt = order.expiresAt.toISOString?.() ?? order.expiresAt;
  if (order.shippedAt) obj.shippedAt = order.shippedAt.toISOString?.() ?? order.shippedAt;
  delete obj._id;
  delete obj.__v;
  return ok(res, obj);
}

export async function submitForInspection(req, res) {
  if (!isSubscriptionActive(req.user)) {
    return forbidden(res, "PACKAGE_REQUIRED");
  }

  const sellerId = req.user.id;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  if (String(listing.seller.id) !== String(sellerId)) return forbidden(res, "Not your listing");

  // Must have at least 1 image URL for demo (frontend enforces photos)
  if (!listing.imageUrls || listing.imageUrls.length === 0) {
    return badRequest(res, "At least 1 photo is required");
  }

  listing.state = "PENDING_INSPECTION";
  listing.inspectionResult = null;
  listing.certificationStatus = "PENDING_CERTIFICATION";
  listing.publishedAt = null;
  listing.listingExpiresAt = null;
  await listing.save();
  return ok(res, normalizeListing(listing));
}

/** Đánh giá & uy tín của seller – tổng hợp từ reviews (trừ HIDDEN). */
export async function getMyRatings(req, res) {
  const sellerId = req.user.id;
  const docs = await Review.find({ sellerId, status: { $ne: "HIDDEN" } }).lean();

  const totalReviews = docs.length;
  if (totalReviews === 0) {
    return ok(res, {
      averageRating: 0,
      totalReviews: 0,
      positivePercent: 0,
      breakdown: {},
    });
  }

  const sum = docs.reduce((acc, r) => acc + (r.rating || 0), 0);
  const averageRating = Math.round((sum / totalReviews) * 10) / 10;
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of docs) {
    const k = Math.min(5, Math.max(1, r.rating || 0));
    breakdown[k] = (breakdown[k] || 0) + 1;
  }
  const positiveCount = (breakdown[4] || 0) + (breakdown[5] || 0);
  const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;

  return ok(res, {
    averageRating,
    totalReviews,
    positivePercent,
    breakdown,
  });
}

