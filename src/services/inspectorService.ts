/**
 * Inspector service – API or mock fallback.
 */
import { inspectorApi } from "@/apis/inspectorApi";
import type { Listing } from "@/types/shopbike";
import { USE_MOCK_API } from "@/lib/apiConfig";

const USE_MOCK = USE_MOCK_API;

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

export async function fetchPendingListings(): Promise<Listing[]> {
  if (USE_MOCK) return MOCK_PENDING;
  try {
    return await inspectorApi.getPendingListings();
  } catch {
    return MOCK_PENDING;
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
