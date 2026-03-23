import { Brand } from "../models/Brand.js";
import { ok, created, badRequest, notFound } from "../utils/http.js";

/** Public: danh sách brands đang active (cho seller form, homepage) */
export async function listBrands(_req, res) {
  const docs = await Brand.find({ active: true })
    .sort({ name: 1 })
    .lean();
  const items = docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    slug: d.slug || "",
  }));
  return ok(res, items);
}

/** Admin: danh sách tất cả brands */
export async function adminListBrands(_req, res) {
  const docs = await Brand.find().sort({ name: 1 }).lean();
  const items = docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    slug: d.slug || "",
    active: d.active !== false,
  }));
  return ok(res, items);
}

/** Admin: tạo brand mới */
export async function adminCreateBrand(req, res) {
  const { name, slug } = req.body || {};
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return badRequest(res, "Brand name is required");

  const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
  if (existing) return badRequest(res, "Brand already exists");

  const doc = await Brand.create({
    name: trimmed,
    slug: typeof slug === "string" ? slug.trim() : trimmed.toLowerCase().replace(/\s+/g, "-"),
    active: true,
  });
  const out = doc.toJSON ? doc.toJSON() : doc;
  return created(res, out);
}

/** Admin: cập nhật brand */
export async function adminUpdateBrand(req, res) {
  const { id } = req.params;
  const { name, slug, active } = req.body || {};

  const doc = await Brand.findById(id);
  if (!doc) return notFound(res, "Brand not found");

  if (typeof name === "string" && name.trim()) {
    const trimmed = name.trim();
    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${trimmed}$`, "i") },
      _id: { $ne: id },
    });
    if (existing) return badRequest(res, "Brand name already exists");
    doc.name = trimmed;
  }
  if (typeof slug === "string") doc.slug = slug.trim();
  if (typeof active === "boolean") doc.active = active;

  await doc.save();
  const out = doc.toJSON ? doc.toJSON() : doc;
  return ok(res, out);
}

/** Admin: xóa brand */
export async function adminDeleteBrand(req, res) {
  const { id } = req.params;
  const doc = await Brand.findByIdAndDelete(id);
  if (!doc) return notFound(res, "Brand not found");
  return ok(res, { deleted: true, id });
}
