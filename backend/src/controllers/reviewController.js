import { z } from "zod";
import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";

const createReviewSchema = z.object({
  listingId: z.string().min(1),
  sellerId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

const adminUpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  status: z.enum(["PENDING", "APPROVED", "EDITED", "HIDDEN"]).optional(),
});

export async function createReviewForOrder(req, res) {
  const { id: orderId } = req.params;
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid review payload");

  const { listingId, sellerId, rating, comment } = parsed.data;
  const buyerId = req.user.id;

  const order = await Order.findById(orderId);
  if (!order) return notFound(res, "Order not found");
  if (order.buyerId.toString() !== buyerId) {
    return forbidden(res, "Not your order");
  }
  if (order.status !== "COMPLETED") {
    return badRequest(res, "Order must be completed before reviewing");
  }

  if (String(order.listingId) !== listingId) {
    return badRequest(res, "Listing does not match order");
  }

  const review = await Review.create({
    orderId,
    listingId,
    sellerId,
    buyerId,
    rating,
    comment: comment || "",
    status: "PENDING",
  });

  const out = review.toJSON ? review.toJSON() : review;
  return created(res, out);
}

export async function listMyReviews(req, res) {
  const buyerId = req.user.id;
  const docs = await Review.find({ buyerId }).sort({ createdAt: -1 });
  const items = docs.map((r) => (r.toJSON ? r.toJSON() : r));
  return ok(res, items);
}

export async function adminListReviews(_req, res) {
  const docs = await Review.find().sort({ createdAt: -1 });
  const items = docs.map((r) => (r.toJSON ? r.toJSON() : r));
  return ok(res, items);
}

export async function adminUpdateReview(req, res) {
  const { id } = req.params;
  const parsed = adminUpdateReviewSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid review update payload");

  const review = await Review.findById(id);
  if (!review) return notFound(res, "Review not found");

  const { rating, comment, status } = parsed.data;
  if (rating != null) review.rating = rating;
  if (comment != null) review.comment = comment;
  if (status != null) review.status = status;

  await review.save();
  const out = review.toJSON ? review.toJSON() : review;
  return ok(res, out);
}

