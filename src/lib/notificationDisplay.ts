import type { TFunction } from "i18next";
import type { AppNotification } from "@/stores/useNotificationStore";

/**
 * Chuỗi tiêu đề / nội dung tiếng Anh đã từng được lưu trực tiếp (không có titleKey)
 * khi tạo thông báo — map sang key i18n để đổi ngôn ngữ theo locale hiện tại.
 */
const LEGACY_EN_TITLE_TO_KEY: Record<string, string> = {
  "Purchase successful": "checkout.successPurchaseTitle",
  "Review submitted": "checkout.successReviewSubmittedTitle",
  Published: "seller.statePublished",
  "Listing submitted for inspection": "seller.submitSuccessTitle",
};

const LEGACY_EN_MESSAGE_TO_KEY: Record<string, string> = {
  "Your order has been confirmed.": "checkout.successOrderConfirmedMsg",
  "Thank you for your feedback.": "checkout.successReviewSubmittedMsg",
  "Publish now with an Unverified badge (30 days) or choose optional inspection for a Certified badge after approval.":
    "seller.publishNote",
  "Publish now with an Unverified badge (30 days). With a VIP plan you can submit for inspection to earn a Certified badge after inspector approval.":
    "seller.publishNote",
  "Listing is awaiting inspector approval.": "seller.submitSuccessMessage",
};

function resolveWithLegacy(
  raw: string,
  key: string | undefined,
  params: Record<string, string | number> | undefined,
  legacyMap: Record<string, string>,
  t: TFunction,
): string {
  if (key) return t(key, params ?? {});
  const mapped = legacyMap[raw];
  if (mapped) return t(mapped, params ?? {});
  return raw;
}

/** Tiêu đề hiển thị theo locale hiện tại */
export function notificationTitle(n: AppNotification, t: TFunction): string {
  return resolveWithLegacy(n.title, n.titleKey, n.titleParams, LEGACY_EN_TITLE_TO_KEY, t);
}

/** Nội dung hiển thị theo locale hiện tại */
export function notificationMessage(n: AppNotification, t: TFunction): string {
  return resolveWithLegacy(n.message, n.messageKey, n.messageParams, LEGACY_EN_MESSAGE_TO_KEY, t);
}
