import type { OrderStatus } from "./order";

export type ReviewStatus = "PENDING" | "APPROVED" | "EDITED" | "HIDDEN";

export type Review = {
  id: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  rating: number; // 1–5
  comment?: string;
  status: ReviewStatus;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type CreateReviewRequest = {
  orderId: string;
  listingId: string;
  sellerId: string;
  rating: number;
  comment?: string;
};

export type AdminUpdateReviewRequest = {
  rating?: number;
  comment?: string;
  status?: ReviewStatus;
};

