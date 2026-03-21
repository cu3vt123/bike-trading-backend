/**
 * Seller API – maps to backend endpoints.
 * Update API_PATHS in apiConfig.ts when Swagger spec is available.
 */
import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type { Listing, BikeDetail } from "@/types/shopbike";
import type { Order } from "@/types/order";

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

export type SellerRatingsSummary = {
  averageRating: number;
  totalReviews: number;
  positivePercent: number;
  breakdown: Record<number, number>;
};

export const sellerApi = {
  getDashboard: (): Promise<{ stats: SellerDashboardStats; listings: Listing[] }> =>
    apiClient.get(API_PATHS.SELLER.DASHBOARD).then((r) => {
      const d = r.data?.data ?? r.data ?? {};
      return {
        stats: d.stats ?? { total: 0, published: 0, inReview: 0, needUpdate: 0 },
        listings: Array.isArray(d.listings) ? d.listings : d.content ?? [],
      };
    }),

  getOrders: (): Promise<Order[]> =>
    apiClient.get(API_PATHS.SELLER.ORDERS).then((r) => {
      const raw = r.data?.data ?? r.data ?? [];
      return Array.isArray(raw) ? raw : [];
    }),

  shipOrderToBuyer: (orderId: string): Promise<Order> =>
    apiClient
      .put(API_PATHS.SELLER.ORDER_SHIP_TO_BUYER(orderId))
      .then((r) => r.data?.data ?? r.data),

  getRatings: (): Promise<SellerRatingsSummary> =>
    apiClient.get(API_PATHS.SELLER.RATINGS).then((r) => {
      const d = r.data?.data ?? r.data ?? {};
      return {
        averageRating: Number(d.averageRating) || 0,
        totalReviews: Number(d.totalReviews) || 0,
        positivePercent: Number(d.positivePercent) || 0,
        breakdown: typeof d.breakdown === "object" && d.breakdown !== null ? d.breakdown : {},
      };
    }),

  getListings: (): Promise<Listing[]> =>
    apiClient.get(API_PATHS.SELLER.LISTINGS).then((r) => {
      const raw = r.data?.content ?? r.data?.data ?? r.data;
      return Array.isArray(raw) ? raw : [];
    }),

  getListingById: (id: string): Promise<BikeDetail> =>
    apiClient.get(API_PATHS.SELLER.LISTING_BY_ID(id)).then((r) => r.data?.data ?? r.data),

  create: (data: CreateListingRequest): Promise<Listing> =>
    apiClient.post(API_PATHS.SELLER.LISTINGS, data).then((r) => r.data?.data ?? r.data),

  update: (id: string, data: Partial<CreateListingRequest>): Promise<Listing> =>
    apiClient.put(API_PATHS.SELLER.LISTING_BY_ID(id), data).then((r) => r.data?.data ?? r.data),

  submitForInspection: (id: string): Promise<Listing> =>
    apiClient.put(API_PATHS.SELLER.LISTING_SUBMIT(id)).then((r) => r.data?.data ?? r.data),

  publishListing: (
    id: string,
    body: { requestInspection: boolean },
  ): Promise<Listing> =>
    apiClient
      .put(API_PATHS.SELLER.LISTING_PUBLISH(id), body)
      .then((r) => r.data?.data ?? r.data),
};
