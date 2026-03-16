import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";

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
    seller: { id: sellerId, name: sellerName, email: sellerEmail },
  });

  return created(res, normalizeListing(listing));
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
    status: { $in: ["SELLER_SHIPPED", "AT_WAREHOUSE_PENDING_ADMIN"] },
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
    delete obj._id;
    delete obj.__v;
    return obj;
  });

  return ok(res, items);
}

export async function submitForInspection(req, res) {
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

