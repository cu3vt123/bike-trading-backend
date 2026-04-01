export type Role = "BUYER" | "SELLER";

export type InspectionResult = "APPROVE" | "REJECT" | "NEED_UPDATE";

export type ListingState =
  | "DRAFT"
  | "PENDING_INSPECTION"
  | "AWAITING_WAREHOUSE"
  | "AT_WAREHOUSE_PENDING_VERIFY"
  | "AT_WAREHOUSE_PENDING_RE_INSPECTION"
  | "NEED_UPDATE"
  | "PUBLISHED"
  | "RESERVED"
  | "IN_TRANSACTION"
  | "SOLD"
  | "REJECTED";

export const BIKE_CONDITION_LABEL = {
  NEW: "New",
  LIKE_NEW: "Like new",
  MINT_USED: "Mint (Used)",
  GOOD_USED: "Good (Used)",
  FAIR_USED: "Fair (Used)",
} as const;

export type BikeCondition = keyof typeof BIKE_CONDITION_LABEL;

export type Currency = "VND" | "USD";

/** Trạng thái nhãn kiểm định trên marketplace */
export type CertificationStatus =
  | "UNVERIFIED"
  | "PENDING_CERTIFICATION"
  | "PENDING_WAREHOUSE"
  | "CERTIFIED";

export type Listing = {
  id: string;
  title: string;

  brand: string;
  model?: string;
  year?: number;
  frameSize?: string;
  condition?: BikeCondition;

  price: number;
  msrp?: number;
  currency?: Currency;

  location?: string;

  thumbnailUrl?: string;
  imageUrls?: string[];

  state: ListingState;
  inspectionResult?: InspectionResult | null;
  certificationStatus?: CertificationStatus;
  /** Seller đã báo gửi xe tới kho (sau duyệt online) */
  sellerShippedToWarehouseAt?: string | null;
  /** Admin đã xác nhận xe tại kho khớp ảnh */
  warehouseIntakeVerifiedAt?: string | null;
  publishedAt?: string;
  listingExpiresAt?: string;
  inspectionScore?: number;
  inspectionNeedUpdateReason?: string;
  inspectionReport?: {
    frameIntegrity: { score: number; label: string };
    drivetrainHealth: { score: number; label: string };
    brakingSystem: { score: number; label: string };
  };

  specs?: Array<{ label: string; value: string }>;
  isHidden?: boolean;
  hiddenAt?: string | null;
};

export type BikeDetail = Listing & {
  description?: string;
  specs?: Record<string, string> | Array<{ label: string; value: string }>;
  inspectionSummary?: string;
  seller?: { id?: string; name?: string; email?: string };
};

/** Đã có mác kiểm định — chỉ theo certificationStatus (không dùng inspectionResult một mình). */
export function isListingCertified(item: Listing): boolean {
  return item.certificationStatus === "CERTIFIED";
}

/** Tin đang bán trên sàn nhưng chưa certified — buyer cần disclaimer */
export function isBuyerUnverifiedRisk(item: Listing): boolean {
  return item.state === "PUBLISHED" && !isListingCertified(item);
}

/** @deprecated Dùng API marketplace; giữ cho mock cũ */
export function isMarketVisible(item: Listing) {
  return item.state === "PUBLISHED";
}
