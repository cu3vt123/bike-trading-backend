/**
 * Seller API – scaffold cho luồng bán.
 * Khi Backend có API, gọi thật. Hiện pages dùng mock.
 */
import apiClient from "@/lib/apiClient";
import type { Listing, BikeDetail } from "@/types/shopbike";

export type SellerDashboardStats = {
  total: number;
  published: number;
  inReview: number;
  needUpdate: number;
};

export type CreateListingRequest = {
  title: string;
  brand: string;
  model?: string;
  year?: number;
  price: number;
  currency?: string;
  frameSize?: string;
  condition?: string;
  location?: string;
  description?: string;
  imageUrls?: string[];
};

export const sellerApi = {
  getDashboard: (): Promise<{ stats: SellerDashboardStats; listings: Listing[] }> =>
    apiClient.get("/seller/dashboard").then((r) => {
      const d = r.data?.data ?? r.data ?? {};
      return {
        stats: d.stats ?? { total: 0, published: 0, inReview: 0, needUpdate: 0 },
        listings: Array.isArray(d.listings) ? d.listings : d.content ?? [],
      };
    }),

  getListings: (): Promise<Listing[]> =>
    apiClient.get("/seller/listings").then((r) => {
      const raw = r.data?.content ?? r.data?.data ?? r.data;
      return Array.isArray(raw) ? raw : [];
    }),

  getListingById: (id: string): Promise<BikeDetail> =>
    apiClient.get(`/seller/listings/${id}`).then((r) => r.data?.data ?? r.data),

  create: (data: CreateListingRequest): Promise<Listing> =>
    apiClient.post("/seller/listings", data).then((r) => r.data?.data ?? r.data),

  update: (id: string, data: Partial<CreateListingRequest>): Promise<Listing> =>
    apiClient.put(`/seller/listings/${id}`, data).then((r) => r.data?.data ?? r.data),

  submitForInspection: (id: string): Promise<Listing> =>
    apiClient.put(`/seller/listings/${id}/submit`).then((r) => r.data?.data ?? r.data),
};
