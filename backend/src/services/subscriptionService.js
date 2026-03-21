import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import {
  PLANS,
  LISTING_DURATION_DAYS,
  SUBSCRIPTION_PERIOD_DAYS,
} from "../constants/subscription.js";

export function isSubscriptionActive(user) {
  if (!user || user.role !== "SELLER") return false;
  const plan = user.subscriptionPlan;
  if (!plan || !["BASIC", "VIP"].includes(plan)) return false;
  const exp = user.subscriptionExpiresAt;
  const t =
    exp instanceof Date ? exp.getTime() : exp ? new Date(exp).getTime() : 0;
  if (!t || t <= Date.now()) return false;
  return true;
}

export function getSlotsLimit(plan) {
  if (plan === "VIP") return PLANS.VIP.maxConcurrentListings;
  if (plan === "BASIC") return PLANS.BASIC.maxConcurrentListings;
  return 0;
}

/** Tin đang chiếm slot: PUBLISHED | RESERVED | IN_TRANSACTION và chưa hết hạn listing */
export async function countActiveListingSlots(sellerId) {
  const now = new Date();
  const oid = mongoose.Types.ObjectId.isValid(sellerId)
    ? new mongoose.Types.ObjectId(sellerId)
    : null;
  if (!oid) return 0;

  return Listing.countDocuments({
    "seller.id": oid,
    state: { $in: ["PUBLISHED", "RESERVED", "IN_TRANSACTION"] },
    isHidden: { $ne: true },
    $or: [{ listingExpiresAt: null }, { listingExpiresAt: { $gt: now } }],
  });
}

export async function buildSubscriptionSummaryForUser(userDoc) {
  if (!userDoc || userDoc.role !== "SELLER") {
    return {
      active: false,
      plan: null,
      expiresAt: null,
      publishedSlotsUsed: 0,
      publishedSlotsLimit: 0,
      listingDurationDays: LISTING_DURATION_DAYS,
    };
  }

  const active = isSubscriptionActive(userDoc);
  const limit = getSlotsLimit(userDoc.subscriptionPlan);
  const used = active ? await countActiveListingSlots(String(userDoc._id)) : 0;

  return {
    active,
    plan: userDoc.subscriptionPlan ?? null,
    expiresAt: userDoc.subscriptionExpiresAt
      ? userDoc.subscriptionExpiresAt.toISOString()
      : null,
    publishedSlotsUsed: used,
    publishedSlotsLimit: limit,
    listingDurationDays: LISTING_DURATION_DAYS,
  };
}

export async function activateSubscription(userId, plan) {
  const expires = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  await User.findByIdAndUpdate(userId, {
    subscriptionPlan: plan,
    subscriptionExpiresAt: expires,
  });
  const user = await User.findById(userId);
  return user;
}
