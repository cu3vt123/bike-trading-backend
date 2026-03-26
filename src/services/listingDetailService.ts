import { useAuthStore } from "@/stores/useAuthStore";
import type { Role } from "@/types/auth";
import type { BikeDetail } from "@/types/shopbike";
import { fetchListingById } from "@/services/buyerService";
import { fetchListingByIdForInspector } from "@/services/inspectorService";

/**
 * Chi tiết listing cho trang public/detail (buyer + fallback inspector khi cần).
 * Logic giữ nguyên ProductDetailPage cũ.
 */
export async function fetchListingDetailForPage(
  id: string,
  role: Role | null,
): Promise<BikeDetail | null> {
  let data: BikeDetail | null = null;
  if (role === "INSPECTOR" || role === "ADMIN") {
    data = await fetchListingByIdForInspector(id);
  }
  if (!data) {
    data = await fetchListingById(id);
  }
  if (!data && useAuthStore.getState().accessToken) {
    data = await fetchListingByIdForInspector(id);
  }
  return data;
}
