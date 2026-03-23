import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { ok, notFound, badRequest } from "../utils/http.js";
import { LISTING_DURATION_DAYS } from "../constants/subscription.js";

function normalize(doc) {
  return doc.toJSON();
}

export async function pendingListings(_req, res) {
  const listings = await Listing.find({ state: "PENDING_INSPECTION", isHidden: { $ne: true } })
    .sort({ updatedAt: -1 })
    .limit(200);
  return res.status(200).json({ content: listings.map(normalize) });
}

export async function getListing(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");
  return ok(res, normalize(listing));
}

const inspectionReportSchema = z.object({
  frameIntegrity: z.object({ score: z.number().min(0).max(5), label: z.string() }),
  drivetrainHealth: z.object({ score: z.number().min(0).max(5), label: z.string() }),
  brakingSystem: z.object({ score: z.number().min(0).max(5), label: z.string() }),
}).optional();

export async function approve(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");

  if (listing.state !== "PENDING_INSPECTION") {
    return badRequest(res, "Listing is not pending inspection");
  }

  const reportParsed = inspectionReportSchema.safeParse(req.body?.inspectionReport);
  const report = reportParsed.success ? reportParsed.data : null;

  listing.inspectionResult = "APPROVE";
  if (report) {
    listing.inspectionReport = report;
    const avg = (report.frameIntegrity.score + report.drivetrainHealth.score + report.brakingSystem.score) / 3;
    listing.inspectionScore = Math.round(avg * 10) / 10;
  } else {
    listing.inspectionScore = listing.inspectionScore ?? 4.5;
  }
  /** Vòng 1 xong: chờ seller gửi xe tới kho → admin xác nhận (vòng 2) mới lên sàn CERTIFIED */
  listing.state = "AWAITING_WAREHOUSE";
  listing.certificationStatus = "PENDING_WAREHOUSE";
  listing.publishedAt = null;
  listing.listingExpiresAt = null;
  listing.sellerShippedToWarehouseAt = null;
  listing.warehouseIntakeVerifiedAt = null;
  listing.inspectionNeedUpdateReason = "";
  await listing.save();
  return ok(res, normalize(listing));
}

export async function reject(req, res) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");

  if (listing.state !== "PENDING_INSPECTION") {
    return badRequest(res, "Listing is not pending inspection");
  }

  listing.inspectionResult = "REJECT";
  listing.state = "REJECTED";
  listing.inspectionNeedUpdateReason = "";
  await listing.save();
  return ok(res, normalize(listing));
}

export async function needUpdate(req, res) {
  const schema = z.object({
    reason: z.string().min(5, "Reason is required"),
  });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return badRequest(res, "Invalid payload");

  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return notFound(res, "Listing not found");

  if (listing.state !== "PENDING_INSPECTION") {
    return badRequest(res, "Listing is not pending inspection");
  }

  listing.inspectionResult = "NEED_UPDATE";
  listing.state = "NEED_UPDATE";
  listing.inspectionNeedUpdateReason = parsed.data.reason;
  await listing.save();
  return ok(res, normalize(listing));
}

