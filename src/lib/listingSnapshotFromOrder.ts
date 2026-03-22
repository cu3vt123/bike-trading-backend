import type { BikeDetail } from "@/types/shopbike";

/** Tin đã RESERVED không còn trong GET /bikes/:id — dùng snapshot lưu trên Order. */
export function listingSnapshotToDetail(
  routeListingId: string,
  snap: unknown,
): BikeDetail | null {
  if (!snap || typeof snap !== "object") return null;
  const s = snap as Record<string, unknown>;
  return {
    id: String(s.id ?? routeListingId),
    title: String(s.title ?? ""),
    brand: String(s.brand ?? ""),
    model: typeof s.model === "string" ? s.model : undefined,
    price: Number(s.price) || 0,
    currency: (s.currency as BikeDetail["currency"]) ?? "VND",
    imageUrls: Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : undefined,
    thumbnailUrl: typeof s.thumbnailUrl === "string" ? s.thumbnailUrl : undefined,
    frameSize: typeof s.frameSize === "string" ? s.frameSize : undefined,
    condition: s.condition as BikeDetail["condition"],
    state: "RESERVED",
  };
}
