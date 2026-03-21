import { Listing } from "../models/Listing.js";
import { ok, notFound } from "../utils/http.js";

function marketplaceFilter() {
  const now = new Date();
  return {
    state: "PUBLISHED",
    isHidden: { $ne: true },
    $or: [{ listingExpiresAt: null }, { listingExpiresAt: { $gt: now } }],
  };
}

export async function listBikes(_req, res) {
  const items = await Listing.find(marketplaceFilter())
    .sort({ createdAt: -1 })
    .limit(200);

  // FE accepts content|data|raw
  return res.status(200).json({ content: items.map((x) => x.toJSON()) });
}

export async function getBike(req, res) {
  const { id } = req.params;
  const item = await Listing.findById(id);
  if (!item || item.isHidden) return notFound(res, "Bike not found");
  const now = new Date();
  if (item.state === "PUBLISHED" && item.listingExpiresAt && item.listingExpiresAt <= now) {
    return notFound(res, "Bike not found");
  }
  return ok(res, item.toJSON());
}

