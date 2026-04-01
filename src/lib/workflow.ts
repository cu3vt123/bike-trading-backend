export type PostState =
  | "DRAFT"
  | "PENDING_INSPECTION"
  | "NEED_UPDATE"
  | "PUBLISHED"
  | "RESERVED"
  | "IN_TRANSACTION"
  | "SOLD"
  | "INACTIVE"
  | "REJECTED";

export type InspectionResult = "APPROVE" | "REJECT" | "NEED_UPDATE";

export const postStateLabel: Record<PostState, string> = {
  DRAFT: "Draft",
  PENDING_INSPECTION: "Pending inspection",
  NEED_UPDATE: "Need update",
  PUBLISHED: "Published",
  RESERVED: "Reserved",
  IN_TRANSACTION: "In transaction",
  SOLD: "Sold",
  INACTIVE: "Inactive",
  REJECTED: "Rejected",
};

export const inspectionLabel: Record<InspectionResult, string> = {
  APPROVE: "Approved",
  REJECT: "Rejected",
  NEED_UPDATE: "Need update",
};

// Rule cốt lõi: chỉ show lên marketplace khi PUBLISHED (và đã APPROVE)
export function isMarketVisible(post: {
  state: PostState;
  inspectionResult?: InspectionResult | null;
}) {
  return post.state === "PUBLISHED" && post.inspectionResult === "APPROVE";
}
