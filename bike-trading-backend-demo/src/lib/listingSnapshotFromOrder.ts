import type { BikeDetail } from "@/types/shopbike";

/** Tin đã RESERVED không còn trong GET /bikes/:id — dùng snapshot lưu trên Order. */
export function listingSnapshotToDetail(
  routeListingId: string,
  snap: unknown,
): BikeDetail | null {
  if (!snap || typeof snap !== "object") return null;
  const s = snap as Record<string, unknown>;
  const seller =
    s.seller && typeof s.seller === "object" && (s.seller as { id?: unknown }).id
      ? { id: String((s.seller as { id: string }).id), name: (s.seller as { name?: string }).name, email: (s.seller as { email?: string }).email }
      : undefined;
  return {
    id: String(s.id ?? routeListingId),
    title: String(s.title ?? ""),
    brand: String(s.brand ?? ""),
    model: typeof s.model === "string" ? s.model : undefined,
    year: typeof s.year === "number" ? s.year : undefined,
    price: Number(s.price) || 0,
    currency: (s.currency as BikeDetail["currency"]) ?? "VND",
    imageUrls: Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : undefined,
    thumbnailUrl: typeof s.thumbnailUrl === "string" ? s.thumbnailUrl : undefined,
    frameSize: typeof s.frameSize === "string" ? s.frameSize : undefined,
    location: typeof s.location === "string" ? s.location : undefined,
    condition: s.condition as BikeDetail["condition"],
    state: "RESERVED",
    seller,
  };
}
