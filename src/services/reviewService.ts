import { reviewApi } from "@/apis/reviewApi";
import type {
  Review,
  CreateReviewRequest,
  AdminUpdateReviewRequest,
} from "@/types/review";
import { USE_MOCK_API } from "@/lib/apiConfig";

const USE_MOCK = USE_MOCK_API;

let MOCK_REVIEWS: Review[] = [];

export async function createReview(payload: CreateReviewRequest): Promise<Review> {
  if (USE_MOCK) {
    const review: Review = {
      id: `RV-${Date.now()}`,
      orderId: payload.orderId,
      listingId: payload.listingId,
      sellerId: payload.sellerId,
      buyerId: "buyer_demo",
      rating: payload.rating,
      comment: payload.comment,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    MOCK_REVIEWS = [review, ...MOCK_REVIEWS];
    return review;
  }
  return reviewApi.createForOrder(payload.orderId, payload);
}

export async function fetchMyReviews(): Promise<Review[]> {
  if (USE_MOCK) return MOCK_REVIEWS;
  return reviewApi.getMyReviews();
}

export async function fetchAdminReviews(): Promise<Review[]> {
  if (USE_MOCK) return MOCK_REVIEWS;
  return reviewApi.adminList();
}

export async function adminUpdateReview(
  id: string,
  payload: AdminUpdateReviewRequest,
): Promise<Review> {
  if (USE_MOCK) {
    const existing = MOCK_REVIEWS.find((r) => r.id === id);
    if (!existing) {
      throw new Error("Không tìm thấy đánh giá.");
    }
    Object.assign(existing, payload, { updatedAt: new Date().toISOString() });
    return existing;
  }
  return reviewApi.adminUpdate(id, payload);
}

