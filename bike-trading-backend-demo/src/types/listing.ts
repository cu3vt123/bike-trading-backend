export type InspectionResult = "APPROVE" | "REJECT" | "NEED_UPDATE";

export type ListingState =
  | "DRAFT"
  | "PENDING_INSPECTION"
  | "NEED_UPDATE"
  | "PUBLISHED"
  | "RESERVED"
  | "IN_TRANSACTION"
  | "SOLD"
  | "REJECTED";

export type Currency = "VND" | "USD";

export type BikeCondition =
  | "MINT_USED"
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "POOR";

export const BIKE_CONDITION_LABEL: Record<BikeCondition, string> = {
  MINT_USED: "Mint (Used)",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export type Listing = {
  // core (backend chắc chắn có)
  id: string;
  title: string;
  brand: string;
  price: number;
  location: string;
  thumbnailUrl?: string;

  state: ListingState;
  inspectionResult?: InspectionResult | null;

  // optional (Sprint 1 UI mock, sau map API thì backend có thì fill, không có thì thôi)
  model?: string;
  year?: number;
  frameSize?: string;
  condition?: BikeCondition;
  msrp?: number;
  currency?: Currency;

  imageUrls?: string[];
  description?: string;

  specs?: Record<string, string | number>;
};

// RULE: chỉ lên marketplace khi đã publish + approve
export function isMarketVisible(item: Listing) {
  return item.state === "PUBLISHED" && item.inspectionResult === "APPROVE";
}
