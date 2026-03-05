import { z } from "zod";
import { Listing } from "../models/Listing.js";
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

