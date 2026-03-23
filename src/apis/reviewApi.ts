import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";
import type {
  Review,
  CreateReviewRequest,
  AdminUpdateReviewRequest,
} from "@/types/review";

export const reviewApi = {
  createForOrder: (orderId: string, payload: CreateReviewRequest): Promise<Review> =>
    apiClient
      .post(API_PATHS.REVIEWS.CREATE_FOR_ORDER(orderId), payload)
      .then((r) => r.data?.data ?? r.data),

  getMyReviews: (): Promise<Review[]> =>
    apiClient
      .get(API_PATHS.REVIEWS.MY_REVIEWS)
      .then((r) => r.data?.data ?? r.data ?? []),

  adminList: (): Promise<Review[]> =>
    apiClient
      .get(API_PATHS.REVIEWS.ADMIN_LIST)
      .then((r) => r.data?.data ?? r.data ?? []),

  adminUpdate: (id: string, payload: AdminUpdateReviewRequest): Promise<Review> =>
    apiClient
      .put(API_PATHS.REVIEWS.ADMIN_UPDATE(id), payload)
      .then((r) => r.data?.data ?? r.data),
};

