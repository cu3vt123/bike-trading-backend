/**
 * Inspector API – scaffold cho luồng kiểm định.
 * Khi Backend có API, gọi thật. Hiện pages dùng mock.
 */
import apiClient from "@/lib/apiClient";
import type { Listing, BikeDetail } from "@/types/shopbike";

export const inspectorApi = {
  getPendingListings: (): Promise<Listing[]> =>
    apiClient
      .get("/inspector/pending-listings")
      .then((r) => {
        const raw = r.data?.content ?? r.data?.data ?? r.data;
        return Array.isArray(raw) ? raw : [];
      }),

  getListingById: (id: string): Promise<BikeDetail> =>
    apiClient
      .get(`/inspector/listings/${id}`)
      .then((r) => r.data?.data ?? r.data),

  approve: (id: string): Promise<{ ok: boolean }> =>
    apiClient
      .put(`/inspector/listings/${id}/approve`)
      .then(() => ({ ok: true })),

  reject: (id: string): Promise<{ ok: boolean }> =>
    apiClient
      .put(`/inspector/listings/${id}/reject`)
      .then(() => ({ ok: true })),

  needUpdate: (id: string, reason?: string): Promise<{ ok: boolean }> =>
    apiClient
      .put(`/inspector/listings/${id}/need-update`, { reason })
      .then(() => ({ ok: true })),
};
