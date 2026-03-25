import { ok, badRequest } from "../utils/http.js";

export function uploadListingImages(req, res) {
  const files = req.files;
  if (!Array.isArray(files) || files.length === 0) {
    return badRequest(res, "No images uploaded");
  }

  const envBase = String(process.env.PUBLIC_ORIGIN || "").replace(/\/$/, "");
  const base =
    envBase || `${req.protocol}://${req.get("host") || "localhost"}`;
  const urls = files.map((f) => `${base}/uploads/listings/${f.filename}`);
  return ok(res, { urls });
}
