/**
 * Inspector API – maps to backend endpoints.
 * Update API_PATHS in apiConfig.ts when Swagger spec is available.
 */
import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Listing, BikeDetail } from "@/types/shopbike";

export const inspectorApi = {
  getPendingListings: (): Promise<Listing[]> =>
    apiClient
      .get(API_PATHS.INSPECTOR.PENDING_LISTINGS)
      .then((r) => {
        const raw = r.data?.content ?? r.data?.data ?? r.data;
        return Array.isArray(raw) ? raw : [];
      }),

  getListingById: (id: string): Promise<BikeDetail> =>
    apiClient
      .get(API_PATHS.INSPECTOR.LISTING_BY_ID(id))
      .then((r) => r.data?.data ?? r.data),

  approve: (
    id: string,
    inspectionReport: {
      frameIntegrity: { score: number; label: string };
      drivetrainHealth: { score: number; label: string };
      brakingSystem: { score: number; label: string };
    },
  ): Promise<{ ok: boolean }> =>
    apiClient.put(API_PATHS.INSPECTOR.LISTING_APPROVE(id), { inspectionReport }).then(() => ({ ok: true })),

  reject: (id: string): Promise<{ ok: boolean }> =>
    apiClient.put(API_PATHS.INSPECTOR.LISTING_REJECT(id)).then(() => ({ ok: true })),

  needUpdate: (id: string, reason?: string): Promise<{ ok: boolean }> =>
    apiClient
      .put(API_PATHS.INSPECTOR.LISTING_NEED_UPDATE(id), { reason })
      .then(() => ({ ok: true })),
};
