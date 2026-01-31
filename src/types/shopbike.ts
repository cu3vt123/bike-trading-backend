export type Role = "BUYER" | "SELLER";

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

export const BIKE_CONDITION_LABEL = {
  NEW: "New",
  LIKE_NEW: "Like new",
  MINT_USED: "Mint (Used)",
  GOOD_USED: "Good (Used)",
  FAIR_USED: "Fair (Used)",
} as const;

export type BikeCondition = keyof typeof BIKE_CONDITION_LABEL;

export type Currency = "VND" | "USD";

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
  inspectionScore?: number; // 0..5 (UI-only)

  specs?: Array<{ label: string; value: string }>;
};

export function isMarketVisible(item: Listing) {
  return item.state === "PUBLISHED" && item.inspectionResult === "APPROVE";
}
