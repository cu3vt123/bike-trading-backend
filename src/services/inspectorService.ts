/**
 * Inspector service – API or mock fallback.
 * Có timeout để tránh load mãi khi backend treo.
 */
import { inspectorApi } from "@/apis/inspectorApi";
import { adminApi } from "@/apis/adminApi";
import type { Listing } from "@/types/shopbike";
import { USE_MOCK_API } from "@/lib/apiConfig";

const USE_MOCK = USE_MOCK_API;

/** Timeout (ms) – sau khoảng này nếu API chưa trả về thì coi như lỗi, dùng mock hoặc báo lỗi */
const FETCH_TIMEOUT_MS = 5_000;

const MOCK_PENDING: Listing[] = [
  {
    id: "mock-1",
    title: "Trek Domane SL — submitted for review",
    brand: "Trek",
    price: 3100,
    location: "Da Nang",
    thumbnailUrl: "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1400&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
  {
    id: "mock-2",
    title: "Giant TCR Advanced — awaiting inspection",
    brand: "Giant",
    price: 2800,
    location: "Ho Chi Minh City",
    thumbnailUrl: "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1400&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
];

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms),
    ),
  ]);
}

export async function fetchPendingListings(): Promise<Listing[]> {
  if (USE_MOCK) return MOCK_PENDING;
  try {
    return await withTimeout(
      inspectorApi.getPendingListings(),
      FETCH_TIMEOUT_MS,
      "Backend không phản hồi.",
    );
  } catch (e) {
    console.warn("[inspector] fetchPendingListings failed:", e);
    const msg =
      e instanceof Error ? e.message : "Không tải được danh sách chờ kiểm định.";
    throw new Error(msg);
  }
}

export type InspectionReport = {
  frameIntegrity: { score: number; label: string };
  drivetrainHealth: { score: number; label: string };
  brakingSystem: { score: number; label: string };
};

export async function approveListing(id: string, inspectionReport: InspectionReport): Promise<void> {
  if (USE_MOCK) return;
  await inspectorApi.approve(id, inspectionReport);
}

export async function rejectListing(id: string): Promise<void> {
  if (USE_MOCK) return;
  await inspectorApi.reject(id);
}

export async function needUpdateListing(id: string, reason?: string): Promise<void> {
  if (USE_MOCK) return;
  await inspectorApi.needUpdate(id, reason);
}

/** Tin tại kho chờ inspector xác nhận lại (Bước 6) — Admin đã xác nhận xe tới. */
export async function fetchWarehouseReInspectionListings(): Promise<Listing[]> {
  if (USE_MOCK) return [];
  try {
    const all = await adminApi.getPendingWarehouseIntakeListings();
    return all.filter((l) => l.state === "AT_WAREHOUSE_PENDING_RE_INSPECTION");
  } catch {
    return [];
  }
}
